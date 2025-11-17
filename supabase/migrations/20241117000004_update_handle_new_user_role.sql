-- Update handle_new_user function to handle role from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')  -- Default to employee if no role specified
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
