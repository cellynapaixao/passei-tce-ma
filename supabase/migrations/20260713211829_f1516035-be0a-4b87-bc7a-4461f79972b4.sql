
ALTER FUNCTION public.tg_touch_updated_at() SET search_path = public;
ALTER FUNCTION public.tg_block_attempt_mutation() SET search_path = public;
ALTER FUNCTION public.srs_sm2_next(numeric, int, int, smallint) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_attempt(uuid, uuid, uuid, public.session_mode_enum, text, int, smallint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_attempt(uuid, uuid, uuid, public.session_mode_enum, text, int, smallint) TO authenticated;
