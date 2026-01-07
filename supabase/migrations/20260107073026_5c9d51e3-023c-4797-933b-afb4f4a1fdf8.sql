-- Add language column to profiles table
ALTER TABLE public.profiles
ADD COLUMN language text DEFAULT 'en';

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.language IS 'User preferred language (de, en, es, fr, it, pt)';