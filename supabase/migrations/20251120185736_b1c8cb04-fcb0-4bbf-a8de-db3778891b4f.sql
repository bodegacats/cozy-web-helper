-- Add AI classification fields to update_requests table
ALTER TABLE update_requests
ADD COLUMN ai_type text,
ADD COLUMN ai_price_cents integer,
ADD COLUMN ai_explanation text,
ADD COLUMN ai_confidence text;