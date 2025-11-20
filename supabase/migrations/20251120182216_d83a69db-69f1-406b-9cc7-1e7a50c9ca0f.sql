-- Create storage bucket for request attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('request-attachments', 'request-attachments', false);

-- RLS policy: Authenticated users (clients and admins) can upload files
CREATE POLICY "Authenticated users can upload request attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'request-attachments');

-- RLS policy: Users can view files they uploaded
CREATE POLICY "Users can view own request attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'request-attachments'
  AND (owner = auth.uid())
);

-- RLS policy: Admins can view all attachments
CREATE POLICY "Admins can view all request attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'request-attachments'
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Add attachments column to update_requests table
ALTER TABLE update_requests
ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN update_requests.attachments IS 'Array of attachment objects with file URLs and metadata';