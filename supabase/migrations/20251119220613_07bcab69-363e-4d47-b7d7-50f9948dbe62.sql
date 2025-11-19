-- Add pricing fields to update_requests table
ALTER TABLE public.update_requests 
  ADD COLUMN size_tier text NOT NULL DEFAULT 'small'
    CHECK (size_tier IN ('tiny', 'small', 'medium', 'large')),
  ADD COLUMN quoted_price_cents integer;

-- Set default quoted_price_cents for existing rows
UPDATE public.update_requests 
SET quoted_price_cents = 5000 
WHERE quoted_price_cents IS NULL;