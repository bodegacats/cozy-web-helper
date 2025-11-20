-- Fix security warnings by setting search_path on functions

-- Update emails_match function with search_path
CREATE OR REPLACE FUNCTION public.emails_match(email1 text, email2 text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT lower(email1) = lower(email2)
$$;

-- Update normalize_email function with search_path
CREATE OR REPLACE FUNCTION public.normalize_email()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.email = lower(NEW.email);
  RETURN NEW;
END;
$$;