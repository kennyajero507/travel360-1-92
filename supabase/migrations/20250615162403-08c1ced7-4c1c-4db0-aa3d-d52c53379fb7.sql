
-- Add the missing 'notes' column to the quotes table, which is causing the save operation to fail.
ALTER TABLE public.quotes ADD COLUMN notes TEXT;

-- Add NOT NULL constraints to essential columns to ensure data integrity.
ALTER TABLE public.quotes ALTER COLUMN client SET NOT NULL;
ALTER TABLE public.quotes ALTER COLUMN mobile SET NOT NULL;
ALTER TABLE public.quotes ALTER COLUMN start_date SET NOT NULL;
ALTER TABLE public.quotes ALTER COLUMN end_date SET NOT NULL;
ALTER TABLE public.quotes ALTER COLUMN adults SET NOT NULL;

-- Enable Row Level Security (RLS) on the quotes table to secure quote data.
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create a policy to ensure users can only view their own quotes.
CREATE POLICY "Users can view their own quotes"
ON public.quotes FOR SELECT
USING (auth.uid() = created_by);

-- Create a policy to allow authenticated users to create new quotes for themselves.
CREATE POLICY "Users can create quotes"
ON public.quotes FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Create a policy to allow users to update their own quotes.
CREATE POLICY "Users can update their own quotes"
ON public.quotes FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Create a policy to allow users to delete their own quotes.
CREATE POLICY "Users can delete their own quotes"
ON public.quotes FOR DELETE
USING (auth.uid() = created_by);
