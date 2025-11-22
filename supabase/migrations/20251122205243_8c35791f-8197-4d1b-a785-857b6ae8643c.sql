-- Enable RLS on project_intakes table (safe if already enabled)
ALTER TABLE public.project_intakes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts into project_intakes
CREATE POLICY "public_insert_intakes"
ON public.project_intakes
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous select from project_intakes
CREATE POLICY "public_select_intakes"
ON public.project_intakes
FOR SELECT
TO anon
USING (true);