
-- 1. Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Rate limits (rolling window per user + bucket)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, bucket)
);

GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No user-facing policies: only service role / SECURITY DEFINER functions touch it.

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  _user_id UUID,
  _bucket TEXT,
  _max_count INTEGER,
  _window_seconds INTEGER
) RETURNS TABLE (allowed BOOLEAN, remaining INTEGER, retry_after_seconds INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.rate_limits%ROWTYPE;
  _now TIMESTAMPTZ := now();
BEGIN
  INSERT INTO public.rate_limits (user_id, bucket, window_start, count)
  VALUES (_user_id, _bucket, _now, 0)
  ON CONFLICT (user_id, bucket) DO NOTHING;

  SELECT * INTO _row FROM public.rate_limits
  WHERE user_id = _user_id AND bucket = _bucket
  FOR UPDATE;

  IF _row.window_start + make_interval(secs => _window_seconds) <= _now THEN
    UPDATE public.rate_limits
    SET window_start = _now, count = 1
    WHERE id = _row.id;
    RETURN QUERY SELECT TRUE, _max_count - 1, 0;
    RETURN;
  END IF;

  IF _row.count >= _max_count THEN
    RETURN QUERY SELECT
      FALSE,
      0,
      GREATEST(1, CEIL(EXTRACT(EPOCH FROM (_row.window_start + make_interval(secs => _window_seconds) - _now)))::INTEGER);
    RETURN;
  END IF;

  UPDATE public.rate_limits
  SET count = _row.count + 1
  WHERE id = _row.id;

  RETURN QUERY SELECT TRUE, _max_count - (_row.count + 1), 0;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(UUID, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(UUID, TEXT, INTEGER, INTEGER) TO authenticated, service_role;

-- 3. Persisted viral score
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS viral_score SMALLINT;

-- 4. Admin read policies
CREATE POLICY "Admins can view all generations"
ON public.generations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
