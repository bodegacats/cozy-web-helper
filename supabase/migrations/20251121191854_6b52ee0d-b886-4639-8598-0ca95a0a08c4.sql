-- Add auth_user_id column to track which clients have portal access
ALTER TABLE clients ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_clients_auth_user_id ON clients(auth_user_id);