-- Phase 1: Fix Critical Data Exposure Issues

-- 1.1 Fix contact_submissions RLS policy
-- Drop the overly permissive policy that allows all authenticated users to view submissions
DROP POLICY IF EXISTS "Authenticated users can view all submissions" ON public.contact_submissions;

-- Create admin-only policy for viewing contact submissions
CREATE POLICY "Only admins can view submissions" 
ON public.contact_submissions 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 1.2 Verify project_intakes policies are correct
-- The existing policies should be fine, but let's ensure no duplicate permissive policies exist
-- Drop any potential duplicate or overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view all intakes" ON public.project_intakes;

-- The existing "Admins can view all intakes" and "Admins can manage all intakes" policies are correct
-- No changes needed for project_intakes

-- Phase 2: Add User Roles Management Policies

-- 2.1 Add INSERT policy for user_roles (only admins can create roles)
CREATE POLICY "Admins can insert roles"
ON public.user_roles 
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2.2 Add UPDATE policy for user_roles (only admins can modify roles)
CREATE POLICY "Admins can update roles"
ON public.user_roles 
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2.3 Add DELETE policy for user_roles (only admins can delete roles)
CREATE POLICY "Admins can delete roles"
ON public.user_roles 
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));