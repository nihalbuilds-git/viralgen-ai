
-- Brand profiles (multiple per user)
CREATE TABLE public.brand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  voice text NOT NULL DEFAULT '',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_profiles TO authenticated;
GRANT ALL ON public.brand_profiles TO service_role;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own brand profiles" ON public.brand_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own brand profiles" ON public.brand_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own brand profiles" ON public.brand_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own brand profiles" ON public.brand_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER brand_profiles_touch BEFORE UPDATE ON public.brand_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX brand_profiles_user_id_idx ON public.brand_profiles(user_id);

-- Public sharing flag on generations
ALTER TABLE public.generations ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS generations_is_public_idx ON public.generations(is_public) WHERE is_public = true;
-- Allow owners to update is_public (currently UPDATE is denied)
CREATE POLICY "Users update own generations" ON public.generations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Funnel analytics events
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event text NOT NULL,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own events" ON public.analytics_events FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users view own events" ON public.analytics_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX analytics_events_user_event_idx ON public.analytics_events(user_id, event, created_at DESC);
