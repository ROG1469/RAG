-- Sync existing auth users to public.users table
-- This fixes the issue where the trigger didn't create user profiles

-- Insert all auth.users into public.users if they don't exist
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email),
  'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Make yourself admin - REPLACE WITH YOUR EMAIL
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
