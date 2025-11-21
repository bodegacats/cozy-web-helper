-- Add lovable_build_prompt column to project_intakes table
ALTER TABLE public.project_intakes 
ADD COLUMN lovable_build_prompt text;