-- Enable RLS on leads table (safe if already enabled)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts into leads
CREATE POLICY "public_insert_leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous select from leads
CREATE POLICY "public_select_leads"
ON public.leads
FOR SELECT
TO anon
USING (true);