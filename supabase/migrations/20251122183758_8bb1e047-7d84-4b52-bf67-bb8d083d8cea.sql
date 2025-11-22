-- Add discount fields to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS discount_offered boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_amount integer DEFAULT 0;

COMMENT ON COLUMN public.leads.discount_offered IS 'Whether a discount was offered during AI intake';
COMMENT ON COLUMN public.leads.discount_amount IS 'Discount amount in dollars (e.g., 50 or 100)';