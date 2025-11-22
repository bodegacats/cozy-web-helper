-- Enable RLS on leads table (safe if already enabled)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts into leads
CREATE POLICY "Allow anonymous insert"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);