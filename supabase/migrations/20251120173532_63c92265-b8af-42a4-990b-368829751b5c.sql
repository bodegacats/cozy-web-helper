-- Create project_intakes table
CREATE TABLE public.project_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT,
  project_description TEXT,
  goals TEXT,
  pages_estimate INTEGER,
  content_readiness TEXT,
  timeline TEXT,
  budget_range TEXT,
  design_examples TEXT,
  special_needs TEXT,
  tech_comfort TEXT,
  fit_status TEXT CHECK (fit_status IN ('good', 'borderline', 'not_fit')) NOT NULL DEFAULT 'good',
  suggested_tier TEXT CHECK (suggested_tier IN ('500', '1000', '1500')),
  kanban_stage TEXT CHECK (kanban_stage IN ('new', 'qualified', 'needs_content', 'ready_to_build', 'in_build', 'waiting_on_client', 'done')) NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'ai_intake',
  raw_summary TEXT,
  raw_conversation JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_intakes ENABLE ROW LEVEL SECURITY;

-- Admins can view all intakes
CREATE POLICY "Admins can view all intakes"
ON public.project_intakes
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage all intakes
CREATE POLICY "Admins can manage all intakes"
ON public.project_intakes
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create index on email for faster lookups
CREATE INDEX idx_project_intakes_email ON public.project_intakes(email);

-- Create index on client_id for faster joins
CREATE INDEX idx_project_intakes_client_id ON public.project_intakes(client_id);

-- Create index on kanban_stage for faster filtering
CREATE INDEX idx_project_intakes_kanban_stage ON public.project_intakes(kanban_stage);