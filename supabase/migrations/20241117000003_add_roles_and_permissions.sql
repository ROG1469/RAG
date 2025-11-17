-- Add role field to users table (business_owner, employee, customer)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'employee' 
CHECK (role IN ('business_owner', 'employee', 'customer'));

-- Add permission fields to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS accessible_by_business_owners BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS accessible_by_employees BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS accessible_by_customers BOOLEAN NOT NULL DEFAULT false;

-- Create customer_queries table for anonymous customer inquiries
CREATE TABLE IF NOT EXISTS public.customer_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'archived'))
);

-- Add email_verified column to users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Business owners can see their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Business owners can see all users
CREATE POLICY "Business owners can view all users" ON public.users
  FOR SELECT USING (
    role = 'business_owner' AND 
    id = auth.uid()
  );

-- Update RLS policies for documents table
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

-- Users can view documents based on role and permissions
CREATE POLICY "Users can view documents based on permissions" ON public.documents
  FOR SELECT USING (
    -- Owner can see their own documents
    user_id = auth.uid() 
    OR
    -- Business owners can access if permission granted
    (accessible_by_business_owners = true AND 
     EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'business_owner'))
    OR
    -- Employees can access if permission granted
    (accessible_by_employees = true AND 
     EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'employee'))
  );

-- Only business owners can upload documents
CREATE POLICY "Business owners can insert documents" ON public.documents
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'business_owner')
  );

-- Only owners can delete their own documents
CREATE POLICY "Owners can delete own documents" ON public.documents
  FOR DELETE USING (user_id = auth.uid());

-- Update RLS policies for chunks table
DROP POLICY IF EXISTS "Users can view chunks" ON public.chunks;

-- Users can view chunks based on document permissions
CREATE POLICY "Users can view chunks based on document permissions" ON public.chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = chunks.document_id
      AND (
        d.user_id = auth.uid()
        OR
        (d.accessible_by_business_owners = true AND 
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'business_owner'))
        OR
        (d.accessible_by_employees = true AND 
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'employee'))
      )
    )
  );

-- Update RLS policies for embeddings table
DROP POLICY IF EXISTS "Users can view embeddings" ON public.embeddings;

-- Users can view embeddings based on chunk/document permissions
CREATE POLICY "Users can view embeddings based on permissions" ON public.embeddings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chunks c
      JOIN public.documents d ON d.id = c.document_id
      WHERE c.id = embeddings.chunk_id
      AND (
        d.user_id = auth.uid()
        OR
        (d.accessible_by_business_owners = true AND 
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'business_owner'))
        OR
        (d.accessible_by_employees = true AND 
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'employee'))
      )
    )
  );

-- Update RLS policies for chat_history table
DROP POLICY IF EXISTS "Users can view own chat history" ON public.chat_history;
DROP POLICY IF EXISTS "Users can insert own chat history" ON public.chat_history;

-- Users can only view their own chat history (no cross-user visibility)
CREATE POLICY "Users can view own chat history" ON public.chat_history
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own chat history
CREATE POLICY "Users can insert own chat history" ON public.chat_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Enable RLS on customer_queries table
ALTER TABLE public.customer_queries ENABLE ROW LEVEL SECURITY;

-- Anyone can insert customer queries (for anonymous customers)
CREATE POLICY "Anyone can insert customer queries" ON public.customer_queries
  FOR INSERT WITH CHECK (true);

-- Only business owners can view customer queries
CREATE POLICY "Business owners can view customer queries" ON public.customer_queries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'business_owner')
  );

-- Only business owners can update customer queries (mark as responded)
CREATE POLICY "Business owners can update customer queries" ON public.customer_queries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'business_owner')
  );

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_documents_permissions ON public.documents(accessible_by_business_owners, accessible_by_employees, accessible_by_customers);
CREATE INDEX IF NOT EXISTS idx_customer_queries_status ON public.customer_queries(status, created_at);

COMMENT ON COLUMN public.users.role IS 'User role: business_owner (full access), employee (limited access), customer (chat only)';
COMMENT ON COLUMN public.documents.accessible_by_business_owners IS 'Whether business owners can access this document';
COMMENT ON COLUMN public.documents.accessible_by_employees IS 'Whether employees can access this document';
COMMENT ON COLUMN public.documents.accessible_by_customers IS 'Whether customers can access this document through chat';
COMMENT ON TABLE public.customer_queries IS 'Anonymous customer inquiries when chatbot cannot answer';
