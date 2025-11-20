-- Remove care plan columns from clients table
ALTER TABLE clients 
  DROP COLUMN IF EXISTS plan_type,
  DROP COLUMN IF EXISTS monthly_included_minutes,
  DROP COLUMN IF EXISTS monthly_fee_cents;

-- Drop the unused request_limits table
DROP TABLE IF EXISTS request_limits CASCADE;

-- Replace the cancellation policy to properly handle status transitions
DROP POLICY IF EXISTS "Clients can cancel own new requests" ON update_requests;

CREATE POLICY "Clients can cancel own new requests"
ON update_requests
FOR UPDATE
TO authenticated
USING (
  client_id IN (
    SELECT id FROM clients WHERE emails_match(email, auth.email())
  )
)
WITH CHECK (
  client_id IN (
    SELECT id FROM clients WHERE emails_match(email, auth.email())
  )
  AND (
    (status = 'cancelled' AND (SELECT status FROM update_requests WHERE id = update_requests.id) = 'new')
    OR status = 'new'
  )
);