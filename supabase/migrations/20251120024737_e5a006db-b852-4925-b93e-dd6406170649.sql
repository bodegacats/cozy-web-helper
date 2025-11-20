-- Create function for case-insensitive email comparison
CREATE OR REPLACE FUNCTION public.emails_match(email1 text, email2 text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT lower(email1) = lower(email2)
$$;

-- Update RLS policy on clients table to use case-insensitive comparison
DROP POLICY IF EXISTS "Clients can view own record" ON clients;
CREATE POLICY "Clients can view own record"
ON clients
FOR SELECT
TO authenticated
USING (public.emails_match(email, auth.email()));

-- Create function to normalize emails to lowercase
CREATE OR REPLACE FUNCTION public.normalize_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email = lower(NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically normalize emails on insert/update
CREATE TRIGGER normalize_client_email
BEFORE INSERT OR UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION public.normalize_email();

-- Normalize all existing emails in the clients table
UPDATE clients SET email = lower(email);