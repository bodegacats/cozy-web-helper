-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can see their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_name TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  website_url TEXT,
  plan_type TEXT NOT NULL DEFAULT 'one_time_1500',
  monthly_included_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can see all clients
CREATE POLICY "Admins can view all clients"
ON public.clients
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Clients can see their own record
CREATE POLICY "Clients can view own record"
ON public.clients
FOR SELECT
TO authenticated
USING (email = auth.email());

-- RLS: Admins can insert/update clients
CREATE POLICY "Admins can manage clients"
ON public.clients
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create update_requests table
CREATE TABLE public.update_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'waiting_on_client', 'done')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  estimated_minutes INTEGER DEFAULT 15,
  actual_minutes INTEGER DEFAULT 0,
  internal_notes TEXT
);

ALTER TABLE public.update_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can see all requests
CREATE POLICY "Admins can view all requests"
ON public.update_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Clients can see their own requests
CREATE POLICY "Clients can view own requests"
ON public.update_requests
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE email = auth.email()
  )
);

-- RLS: Clients can insert their own requests
CREATE POLICY "Clients can create own requests"
ON public.update_requests
FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT id FROM public.clients WHERE email = auth.email()
  )
);

-- RLS: Admins can update/delete all requests
CREATE POLICY "Admins can manage all requests"
ON public.update_requests
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_requests_updated_at
BEFORE UPDATE ON public.update_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();