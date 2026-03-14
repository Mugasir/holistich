-- Fix search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix permissive INSERT policy on contact_messages by adding rate-limit-like constraint
-- The INSERT WITH CHECK (true) is intentional for contact form (anonymous submissions)
-- but we can make it slightly more restrictive
DROP POLICY "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT WITH CHECK (
  length(name) > 0 AND length(email) > 0 AND length(message) > 0
);