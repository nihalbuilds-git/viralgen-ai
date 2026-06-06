DROP POLICY IF EXISTS "Users insert own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users update own subscription" ON public.user_subscriptions;

CREATE POLICY "Users create own free subscription"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND plan_id = 'free');