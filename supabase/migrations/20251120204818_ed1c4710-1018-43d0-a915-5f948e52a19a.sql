-- Add pricing estimator fields to contact_submissions table
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS selected_options JSONB,
ADD COLUMN IF NOT EXISTS estimate_low INTEGER,
ADD COLUMN IF NOT EXISTS estimate_high INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN contact_submissions.selected_options IS 'JSON object containing all user selections from the pricing estimator';
COMMENT ON COLUMN contact_submissions.estimate_low IS 'Low end of price range estimate in cents';
COMMENT ON COLUMN contact_submissions.estimate_high IS 'High end of price range estimate in cents';
COMMENT ON COLUMN contact_submissions.notes IS 'Optional notes from user during estimate submission';