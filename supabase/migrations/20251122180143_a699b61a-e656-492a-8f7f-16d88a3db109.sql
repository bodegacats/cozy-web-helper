-- Phase 1: Create unified leads table
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Contact info
  name text NOT NULL,
  email text NOT NULL,
  
  -- Source tracking
  source text NOT NULL CHECK (source IN ('ai_intake', 'quote', 'checkup', 'contact')),
  
  -- Pricing fields (for quote & ai_intake)
  page_count integer,
  content_shaping boolean DEFAULT false,
  rush boolean DEFAULT false,
  estimated_price integer,
  
  -- Business info
  business_name text,
  business_description text,
  project_notes text,
  website_url text,
  
  -- Design fields (for ai_intake)
  vibe_description text,
  inspiration_sites text,
  color_preferences text,
  design_prompt text,
  
  -- AI intake specific
  goals text,
  content_readiness text,
  timeline text,
  budget_range text,
  special_needs text,
  tech_comfort text,
  fit_status text,
  suggested_tier text,
  raw_summary text,
  raw_conversation jsonb,
  
  -- Checkup specific
  wish text,
  
  -- Conversion tracking
  status text DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'contacted', 'qualified', 'converted', 'not_fit')),
  converted_to_client_id uuid REFERENCES public.clients(id),
  converted_at timestamp with time zone,
  
  -- Optional: lead scoring
  lead_score integer
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can insert leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
  ON public.leads
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
  ON public.leads
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads"
  ON public.leads
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for performance
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_source ON public.leads(source);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- Update clients table to track lead source
ALTER TABLE public.clients
ADD COLUMN source_lead_id uuid REFERENCES public.leads(id);

-- Migrate data from project_intakes
INSERT INTO public.leads (
  name,
  email,
  source,
  page_count,
  estimated_price,
  business_name,
  business_description,
  goals,
  content_readiness,
  timeline,
  budget_range,
  special_needs,
  tech_comfort,
  fit_status,
  suggested_tier,
  raw_summary,
  raw_conversation,
  design_prompt,
  created_at
)
SELECT
  name,
  email,
  COALESCE(source, 'ai_intake') as source,
  pages_estimate,
  CASE 
    WHEN suggested_tier = '500' THEN 50000
    WHEN suggested_tier = '1000' THEN 100000
    WHEN suggested_tier = '1500' THEN 150000
  END as estimated_price,
  business_name,
  project_description,
  goals,
  content_readiness,
  timeline,
  budget_range,
  special_needs,
  tech_comfort,
  fit_status,
  suggested_tier,
  raw_summary,
  raw_conversation,
  lovable_build_prompt,
  created_at
FROM public.project_intakes;

-- Migrate data from contact_submissions
INSERT INTO public.leads (
  name,
  email,
  source,
  business_description,
  website_url,
  wish,
  estimated_price,
  project_notes,
  created_at
)
SELECT
  name,
  email,
  submission_type as source,
  project_description,
  website_url,
  wish,
  CASE 
    WHEN estimate_low IS NOT NULL THEN (estimate_low + COALESCE(estimate_high, estimate_low)) / 2
  END as estimated_price,
  notes,
  created_at
FROM public.contact_submissions;