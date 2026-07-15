
-- 1) Schema privado (não exposto pela Data API)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 2) has_role em schema privado — mantém SECURITY DEFINER (necessário para evitar recursão em RLS de user_roles)
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 3) Recria políticas referenciando private.has_role
DROP POLICY IF EXISTS "Editions writable by admins" ON public.exam_editions;
CREATE POLICY "Editions writable by admins" ON public.exam_editions
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Positions writable by admins" ON public.positions;
CREATE POLICY "Positions writable by admins" ON public.positions
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "QPM writable by curators" ON public.question_position_matches;
CREATE POLICY "QPM writable by curators" ON public.question_position_matches
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'curator') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'curator') OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Relationships writable by curators" ON public.question_relationships;
CREATE POLICY "Relationships writable by curators" ON public.question_relationships
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'curator') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'curator') OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "QSM writable by curators" ON public.question_syllabus_matches;
CREATE POLICY "QSM writable by curators" ON public.question_syllabus_matches
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'curator') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'curator') OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Curators read all questions" ON public.questions;
CREATE POLICY "Curators read all questions" ON public.questions
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'curator') OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Curators write questions" ON public.questions;
CREATE POLICY "Curators write questions" ON public.questions
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'curator') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'curator') OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Syllabus writable by curators" ON public.syllabus_nodes;
CREATE POLICY "Syllabus writable by curators" ON public.syllabus_nodes
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'curator') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'curator') OR private.has_role(auth.uid(), 'admin'));

-- 4) Remove has_role público após políticas migrarem
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 5) submit_attempt: converte para SECURITY INVOKER; RLS já cobre todas as escritas
CREATE OR REPLACE FUNCTION public.submit_attempt(
  p_client_attempt_id uuid,
  p_question_id uuid,
  p_session_id uuid,
  p_mode public.session_mode_enum,
  p_selected_key text,
  p_response_time_ms integer,
  p_confidence smallint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_correct_key text;
  v_explanation text;
  v_is_correct boolean;
  v_grade smallint;
  v_existing public.question_attempts%ROWTYPE;
  v_new_id uuid;
  v_prev public.srs_states%ROWTYPE;
  v_next record;
  v_algo text := 'sm2.v1';
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  SELECT * INTO v_existing FROM public.question_attempts
    WHERE user_id = v_user_id AND client_attempt_id = p_client_attempt_id;

  IF FOUND THEN
    SELECT correct_key, explanation INTO v_correct_key, v_explanation
      FROM public.questions WHERE id = v_existing.question_id;
    RETURN jsonb_build_object(
      'attempt_id', v_existing.id,
      'is_correct', v_existing.is_correct,
      'correct_key', v_correct_key,
      'explanation', v_explanation,
      'idempotent', true
    );
  END IF;

  SELECT correct_key, explanation INTO v_correct_key, v_explanation
    FROM public.questions WHERE id = p_question_id AND review_status = 'published';
  IF v_correct_key IS NULL THEN
    RAISE EXCEPTION 'question not available';
  END IF;

  v_is_correct := (p_selected_key IS NOT NULL AND p_selected_key = v_correct_key);
  v_grade := CASE
    WHEN v_is_correct AND COALESCE(p_confidence, 3) >= 4 THEN 5
    WHEN v_is_correct THEN 4
    WHEN p_selected_key IS NULL THEN 0
    ELSE 2
  END;

  INSERT INTO public.question_attempts (
    user_id, client_attempt_id, question_id, session_id, mode,
    selected_key, is_correct, response_time_ms, confidence, algorithm_version
  ) VALUES (
    v_user_id, p_client_attempt_id, p_question_id, p_session_id, COALESCE(p_mode, 'geral'),
    p_selected_key, v_is_correct, p_response_time_ms, p_confidence, v_algo
  )
  RETURNING id INTO v_new_id;

  SELECT * INTO v_prev FROM public.srs_states
    WHERE user_id = v_user_id AND question_id = p_question_id FOR UPDATE;

  IF NOT FOUND THEN
    v_prev.easiness := 2.5;
    v_prev.interval_days := 0;
    v_prev.repetitions := 0;
  END IF;

  SELECT * INTO v_next FROM public.srs_sm2_next(v_prev.easiness, v_prev.interval_days, v_prev.repetitions, v_grade);

  INSERT INTO public.srs_states (user_id, question_id, easiness, interval_days, repetitions, due_at, last_grade, algorithm_version, updated_at)
  VALUES (v_user_id, p_question_id, v_next.easiness, v_next.interval_days, v_next.repetitions, v_next.due_at, v_grade, v_algo, now())
  ON CONFLICT (user_id, question_id) DO UPDATE
    SET easiness = EXCLUDED.easiness,
        interval_days = EXCLUDED.interval_days,
        repetitions = EXCLUDED.repetitions,
        due_at = EXCLUDED.due_at,
        last_grade = EXCLUDED.last_grade,
        algorithm_version = EXCLUDED.algorithm_version,
        updated_at = now();

  IF p_session_id IS NOT NULL THEN
    UPDATE public.study_sessions
      SET question_count = question_count + 1,
          correct_count = correct_count + CASE WHEN v_is_correct THEN 1 ELSE 0 END
      WHERE id = p_session_id AND user_id = v_user_id;
  END IF;

  IF NOT v_is_correct THEN
    INSERT INTO public.review_recommendations (user_id, source_attempt_id, target_question_id, reason, priority)
    SELECT v_user_id, v_new_id, r.target_id, r.kind, 2
      FROM public.question_relationships r
      WHERE r.origin_id = p_question_id AND r.kind IN ('similar','variation','source_of_confusion');
  END IF;

  RETURN jsonb_build_object(
    'attempt_id', v_new_id,
    'is_correct', v_is_correct,
    'correct_key', v_correct_key,
    'explanation', v_explanation,
    'next_due_at', v_next.due_at,
    'idempotent', false
  );
END;$$;
