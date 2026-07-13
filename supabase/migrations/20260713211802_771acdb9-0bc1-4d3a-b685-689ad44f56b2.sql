
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'curator', 'user');
CREATE TYPE public.question_type_enum AS ENUM ('multipla_escolha_5', 'certo_errado', 'discursiva');
CREATE TYPE public.exam_format_enum AS ENUM ('objetiva', 'discursiva');
CREATE TYPE public.exam_block_enum AS ENUM ('gerais', 'especificos');
CREATE TYPE public.review_status_enum AS ENUM ('draft', 'in_review', 'approved', 'published', 'retired');
CREATE TYPE public.session_mode_enum AS ENUM ('geral', 'foco', 'revisao', 'diagnostico');
CREATE TYPE public.cargo_enum AS ENUM ('analista', 'auditor', 'tecnico');

-- ============================================================
-- USER ROLES (separate table; never on profiles)
-- ============================================================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============================================================
-- EXAM EDITIONS + POSITIONS
-- ============================================================
CREATE TABLE public.exam_editions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  year int NOT NULL,
  organizer text NOT NULL,
  official_url text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exam_editions TO anon, authenticated;
GRANT ALL ON public.exam_editions TO service_role;
ALTER TABLE public.exam_editions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Editions readable" ON public.exam_editions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Editions writable by admins" ON public.exam_editions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id uuid NOT NULL REFERENCES public.exam_editions(id) ON DELETE CASCADE,
  code text NOT NULL,
  cargo public.cargo_enum NOT NULL,
  especialidade text NOT NULL,
  full_name text NOT NULL,
  exam_date date,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (edition_id, code)
);
GRANT SELECT ON public.positions TO anon, authenticated;
GRANT ALL ON public.positions TO service_role;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Positions readable" ON public.positions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Positions writable by admins" ON public.positions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- SYLLABUS
-- ============================================================
CREATE TABLE public.syllabus_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id uuid NOT NULL REFERENCES public.exam_editions(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.syllabus_nodes(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  exam_block public.exam_block_enum NOT NULL,
  ordering int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (edition_id, code)
);
GRANT SELECT ON public.syllabus_nodes TO anon, authenticated;
GRANT ALL ON public.syllabus_nodes TO service_role;
ALTER TABLE public.syllabus_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Syllabus readable" ON public.syllabus_nodes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Syllabus writable by curators" ON public.syllabus_nodes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'curator') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'curator') OR public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- QUESTIONS (curadoria)
-- ============================================================
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_type public.question_type_enum NOT NULL,
  exam_format public.exam_format_enum NOT NULL,
  exam_block public.exam_block_enum NOT NULL,
  question_weight numeric(6,2) NOT NULL DEFAULT 1.0,
  statement text NOT NULL,
  alternatives jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_key text,
  explanation text,
  distractor_rationales jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_reference jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_status public.review_status_enum NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT questions_mc5_alt_count CHECK (
    question_type <> 'multipla_escolha_5' OR jsonb_array_length(alternatives) = 5
  ),
  CONSTRAINT questions_weight_positive CHECK (question_weight > 0)
);
GRANT SELECT ON public.questions TO anon, authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions published readable" ON public.questions FOR SELECT TO anon, authenticated
  USING (review_status = 'published');
CREATE POLICY "Curators read all questions" ON public.questions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'curator') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Curators write questions" ON public.questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'curator') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'curator') OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.tg_touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;$$;
CREATE TRIGGER trg_questions_touch BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TABLE public.question_syllabus_matches (
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  syllabus_node_id uuid NOT NULL REFERENCES public.syllabus_nodes(id) ON DELETE CASCADE,
  weight numeric(4,2) NOT NULL DEFAULT 1.0,
  PRIMARY KEY (question_id, syllabus_node_id)
);
GRANT SELECT ON public.question_syllabus_matches TO anon, authenticated;
GRANT ALL ON public.question_syllabus_matches TO service_role;
ALTER TABLE public.question_syllabus_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "QSM readable" ON public.question_syllabus_matches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "QSM writable by curators" ON public.question_syllabus_matches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'curator') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'curator') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.question_position_matches (
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  position_id uuid NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  aderencia numeric(4,2) NOT NULL DEFAULT 1.0,
  edital_ref text,
  PRIMARY KEY (question_id, position_id)
);
GRANT SELECT ON public.question_position_matches TO anon, authenticated;
GRANT ALL ON public.question_position_matches TO service_role;
ALTER TABLE public.question_position_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "QPM readable" ON public.question_position_matches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "QPM writable by curators" ON public.question_position_matches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'curator') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'curator') OR public.has_role(auth.uid(), 'admin'));

-- Editorial relationships (global, not per user)
CREATE TABLE public.question_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  target_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('similar','prerequisite','variation','source_of_confusion')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (origin_id, target_id, kind),
  CHECK (origin_id <> target_id)
);
GRANT SELECT ON public.question_relationships TO anon, authenticated;
GRANT ALL ON public.question_relationships TO service_role;
ALTER TABLE public.question_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Relationships readable" ON public.question_relationships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Relationships writable by curators" ON public.question_relationships FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'curator') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'curator') OR public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STUDY SESSIONS
-- ============================================================
CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode public.session_mode_enum NOT NULL DEFAULT 'geral',
  position_id uuid REFERENCES public.positions(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  question_count int NOT NULL DEFAULT 0,
  correct_count int NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE ON public.study_sessions TO authenticated;
GRANT ALL ON public.study_sessions TO service_role;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own sessions" ON public.study_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- QUESTION ATTEMPTS (imutável, idempotente via client_attempt_id)
-- ============================================================
CREATE TABLE public.question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_attempt_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.questions(id),
  session_id uuid REFERENCES public.study_sessions(id),
  mode public.session_mode_enum NOT NULL DEFAULT 'geral',
  selected_key text,
  is_correct boolean NOT NULL,
  response_time_ms int,
  confidence smallint CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 5),
  error_type text,
  algorithm_version text NOT NULL DEFAULT 'sm2.v1',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_attempt_id)
);
CREATE INDEX idx_attempts_user_created ON public.question_attempts(user_id, created_at DESC);
CREATE INDEX idx_attempts_user_question ON public.question_attempts(user_id, question_id);
GRANT SELECT, INSERT ON public.question_attempts TO authenticated;
GRANT ALL ON public.question_attempts TO service_role;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own attempts read" ON public.question_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own attempts insert" ON public.question_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Immutability trigger
CREATE OR REPLACE FUNCTION public.tg_block_attempt_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'question_attempts is immutable'; END;$$;
CREATE TRIGGER trg_attempts_no_update BEFORE UPDATE ON public.question_attempts
  FOR EACH ROW EXECUTE FUNCTION public.tg_block_attempt_mutation();
CREATE TRIGGER trg_attempts_no_delete BEFORE DELETE ON public.question_attempts
  FOR EACH ROW EXECUTE FUNCTION public.tg_block_attempt_mutation();

-- ============================================================
-- SRS STATES (SM-2)
-- ============================================================
CREATE TABLE public.srs_states (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  easiness numeric(4,2) NOT NULL DEFAULT 2.5,
  interval_days int NOT NULL DEFAULT 0,
  repetitions int NOT NULL DEFAULT 0,
  due_at timestamptz NOT NULL DEFAULT now(),
  last_grade smallint,
  algorithm_version text NOT NULL DEFAULT 'sm2.v1',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);
CREATE INDEX idx_srs_due ON public.srs_states(user_id, due_at);
GRANT SELECT, INSERT, UPDATE ON public.srs_states TO authenticated;
GRANT ALL ON public.srs_states TO service_role;
ALTER TABLE public.srs_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own srs" ON public.srs_states FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STUDY PROFILE CHECKINS (opcional, a cada 5 questões)
-- ============================================================
CREATE TABLE public.study_profile_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.study_sessions(id),
  question_index int NOT NULL,
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.study_profile_checkins TO authenticated;
GRANT ALL ON public.study_profile_checkins TO service_role;
ALTER TABLE public.study_profile_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own checkins" ON public.study_profile_checkins FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- REVIEW RECOMMENDATIONS (private per user)
-- ============================================================
CREATE TABLE public.review_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_attempt_id uuid REFERENCES public.question_attempts(id) ON DELETE SET NULL,
  target_question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  reason text,
  priority smallint NOT NULL DEFAULT 1,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reco_user ON public.review_recommendations(user_id, consumed_at, priority);
GRANT SELECT, INSERT, UPDATE ON public.review_recommendations TO authenticated;
GRANT ALL ON public.review_recommendations TO service_role;
ALTER TABLE public.review_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own recommendations" ON public.review_recommendations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- USER PREFERENCES (a11y + estudo)
-- ============================================================
CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  font_scale smallint NOT NULL DEFAULT 100 CHECK (font_scale BETWEEN 80 AND 200),
  high_contrast boolean NOT NULL DEFAULT false,
  reduce_motion boolean NOT NULL DEFAULT false,
  tts_enabled boolean NOT NULL DEFAULT false,
  preferred_position_id uuid REFERENCES public.positions(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own preferences" ON public.user_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SM-2 SQL function (canonical implementation)
-- ============================================================
CREATE OR REPLACE FUNCTION public.srs_sm2_next(
  p_easiness numeric,
  p_interval_days int,
  p_repetitions int,
  p_grade smallint
) RETURNS TABLE (easiness numeric, interval_days int, repetitions int, due_at timestamptz)
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  new_ef numeric := p_easiness;
  new_int int := p_interval_days;
  new_reps int := p_repetitions;
BEGIN
  IF p_grade < 0 OR p_grade > 5 THEN
    RAISE EXCEPTION 'grade must be 0..5';
  END IF;
  -- SM-2
  new_ef := GREATEST(1.3, p_easiness + (0.1 - (5 - p_grade) * (0.08 + (5 - p_grade) * 0.02)));
  IF p_grade < 3 THEN
    new_reps := 0;
    new_int := 1;
  ELSE
    new_reps := p_repetitions + 1;
    IF new_reps = 1 THEN new_int := 1;
    ELSIF new_reps = 2 THEN new_int := 6;
    ELSE new_int := GREATEST(1, ROUND(p_interval_days * new_ef))::int;
    END IF;
  END IF;
  easiness := new_ef;
  interval_days := new_int;
  repetitions := new_reps;
  due_at := now() + (new_int || ' days')::interval;
  RETURN NEXT;
END;$$;

-- ============================================================
-- submit_attempt RPC: atomic + idempotent
-- ============================================================
CREATE OR REPLACE FUNCTION public.submit_attempt(
  p_client_attempt_id uuid,
  p_question_id uuid,
  p_session_id uuid,
  p_mode public.session_mode_enum,
  p_selected_key text,
  p_response_time_ms int,
  p_confidence smallint
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

  -- Idempotency: if this client_attempt_id already exists, return the stored result.
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

  -- SRS update
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

  -- Update session counters
  IF p_session_id IS NOT NULL THEN
    UPDATE public.study_sessions
      SET question_count = question_count + 1,
          correct_count = correct_count + CASE WHEN v_is_correct THEN 1 ELSE 0 END
      WHERE id = p_session_id AND user_id = v_user_id;
  END IF;

  -- If wrong: enqueue review recommendations from editorial relationships
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

GRANT EXECUTE ON FUNCTION public.submit_attempt(uuid, uuid, uuid, public.session_mode_enum, text, int, smallint) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.submit_attempt(uuid, uuid, uuid, public.session_mode_enum, text, int, smallint) FROM anon;

-- ============================================================
-- SEED: TCE-MA 2026 edition + 16 posições
-- ============================================================
INSERT INTO public.exam_editions (slug, name, year, organizer, official_url, config)
VALUES (
  'tce-ma-2026',
  'Concurso TCE-MA 2026',
  2026,
  'Cebraspe',
  'https://cdn.cebraspe.org.br/concursos/TCE_MA_26/arquivos/5FADC380CB030A07F557A9C5EEA6D063017A2CA675E683F39C50B65E6D70F57B.pdf',
  '{"alternativas":5,"gerais":40,"especificos":60,"peso_especificos":2,"total_pontos":160,"nota_minima":64}'::jsonb
);

WITH ed AS (SELECT id FROM public.exam_editions WHERE slug = 'tce-ma-2026')
INSERT INTO public.positions (edition_id, code, cargo, especialidade, full_name, exam_date)
SELECT ed.id, v.code, v.cargo::public.cargo_enum, v.especialidade, v.full_name, v.exam_date::date FROM ed,
(VALUES
  ('analista-administracao','analista','Administração','Analista Estadual de Apoio ao Controle Externo — Administração','2026-11-22'),
  ('analista-contabilidade','analista','Contabilidade','Analista Estadual de Apoio ao Controle Externo — Contabilidade','2026-11-22'),
  ('analista-direito','analista','Direito','Analista Estadual de Apoio ao Controle Externo — Direito','2026-11-22'),
  ('analista-eng-telecom','analista','Engenharia de Telecomunicações','Analista Estadual de Apoio ao Controle Externo — Engenharia de Telecomunicações','2026-11-22'),
  ('analista-eng-eletrica','analista','Engenharia Elétrica','Analista Estadual de Apoio ao Controle Externo — Engenharia Elétrica','2026-11-22'),
  ('analista-eng-mecanica','analista','Engenharia Mecânica','Analista Estadual de Apoio ao Controle Externo — Engenharia Mecânica','2026-11-22'),
  ('analista-estatistica','analista','Estatística','Analista Estadual de Apoio ao Controle Externo — Estatística','2026-11-22'),
  ('analista-medicina','analista','Medicina','Analista Estadual de Apoio ao Controle Externo — Medicina','2026-11-22'),
  ('analista-psicologia','analista','Psicologia','Analista Estadual de Apoio ao Controle Externo — Psicologia','2026-11-22'),
  ('analista-ti','analista','Tecnologia da Informação','Analista Estadual de Apoio ao Controle Externo — Tecnologia da Informação','2026-11-22'),
  ('auditor-atuariais','auditor','Ciências Atuariais','Auditor Estadual de Controle Externo — Ciências Atuariais','2026-11-29'),
  ('auditor-controle-externo','auditor','Controle Externo','Auditor Estadual de Controle Externo — Controle Externo','2026-11-29'),
  ('auditor-engenharia','auditor','Engenharia','Auditor Estadual de Controle Externo — Engenharia','2026-11-29'),
  ('auditor-medicina','auditor','Medicina','Auditor Estadual de Controle Externo — Medicina','2026-11-29'),
  ('auditor-ti','auditor','Tecnologia da Informação','Auditor Estadual de Controle Externo — Tecnologia da Informação','2026-11-29'),
  ('tecnico-administrativa','tecnico','Técnico-Administrativa','Técnico Estadual de Controle Externo — Técnico-Administrativa','2026-11-29')
) AS v(code, cargo, especialidade, full_name, exam_date);
