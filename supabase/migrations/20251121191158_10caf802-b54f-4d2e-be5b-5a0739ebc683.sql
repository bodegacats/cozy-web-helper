-- Add submission_type column to contact_submissions table
ALTER TABLE contact_submissions 
ADD COLUMN submission_type text NOT NULL DEFAULT 'contact';

-- Add a check constraint to ensure valid submission types
ALTER TABLE contact_submissions
ADD CONSTRAINT valid_submission_type 
CHECK (submission_type IN ('quote', 'checkup', 'contact'));