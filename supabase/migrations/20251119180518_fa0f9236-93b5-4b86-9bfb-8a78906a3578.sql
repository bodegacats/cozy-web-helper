-- Update clients table with new fields
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS monthly_fee_cents integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS setup_fee_cents integer DEFAULT 150000,
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

-- Create request_limits table
CREATE TABLE IF NOT EXISTS public.request_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  month date NOT NULL,
  included_requests integer DEFAULT 2,
  used_requests integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, month)
);

-- Enable RLS on request_limits
ALTER TABLE public.request_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for request_limits
CREATE POLICY "Clients can view own request limits"
ON public.request_limits
FOR SELECT
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE email = auth.email()
  )
);

CREATE POLICY "Admins can manage all request limits"
ON public.request_limits
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_request_limits_client_month 
ON public.request_limits(client_id, month);

-- Add index for active clients
CREATE INDEX IF NOT EXISTS idx_clients_active 
ON public.clients(active);