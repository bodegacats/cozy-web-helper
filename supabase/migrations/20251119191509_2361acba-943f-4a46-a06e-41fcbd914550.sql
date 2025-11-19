-- Add status to contact_submissions
ALTER TABLE contact_submissions 
ADD COLUMN status text NOT NULL DEFAULT 'new';

-- Add check constraint for status values
ALTER TABLE contact_submissions
ADD CONSTRAINT contact_submissions_status_check 
CHECK (status IN ('new', 'replied', 'not_fit', 'converted'));

-- Add pipeline_stage and source_submission_id to clients
ALTER TABLE clients
ADD COLUMN pipeline_stage text NOT NULL DEFAULT 'lead',
ADD COLUMN source_submission_id uuid REFERENCES contact_submissions(id);

-- Add check constraint for pipeline_stage values
ALTER TABLE clients
ADD CONSTRAINT clients_pipeline_stage_check 
CHECK (pipeline_stage IN ('lead', 'qualified', 'proposal', 'build', 'launched', 'care_plan', 'lost'));

-- Add index for pipeline queries
CREATE INDEX idx_clients_pipeline_stage ON clients(pipeline_stage);

-- Add index for source submission lookups
CREATE INDEX idx_clients_source_submission ON clients(source_submission_id);