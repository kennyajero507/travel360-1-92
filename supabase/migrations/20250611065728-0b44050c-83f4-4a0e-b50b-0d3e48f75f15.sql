
-- Fix the quotes table to use consistent field naming
-- Remove excursions column and ensure activities is properly structured
ALTER TABLE public.quotes DROP COLUMN IF EXISTS excursions;

-- Ensure activities column exists with proper default
ALTER TABLE public.quotes ALTER COLUMN activities SET DEFAULT '[]'::jsonb;

-- Update any existing quotes that might have null activities
UPDATE public.quotes SET activities = '[]'::jsonb WHERE activities IS NULL;

-- Add RLS policies for quotes table if they don't exist
DO $$ 
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
    
    -- Create policies if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can view quotes from their organization') THEN
        CREATE POLICY "Users can view quotes from their organization" 
        ON public.quotes FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p 
                WHERE p.id = auth.uid() 
                AND (
                    p.role = 'system_admin' 
                    OR EXISTS (
                        SELECT 1 FROM public.profiles creator 
                        WHERE creator.id::text = quotes.created_by 
                        AND creator.org_id = p.org_id
                    )
                )
            )
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can create quotes for their organization') THEN
        CREATE POLICY "Users can create quotes for their organization" 
        ON public.quotes FOR INSERT 
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.profiles p 
                WHERE p.id = auth.uid() 
                AND p.org_id IS NOT NULL
                AND p.role IN ('org_owner', 'tour_operator', 'agent')
            )
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can update quotes from their organization') THEN
        CREATE POLICY "Users can update quotes from their organization" 
        ON public.quotes FOR UPDATE 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p 
                WHERE p.id = auth.uid() 
                AND (
                    p.role = 'system_admin' 
                    OR EXISTS (
                        SELECT 1 FROM public.profiles creator 
                        WHERE creator.id::text = quotes.created_by 
                        AND creator.org_id = p.org_id
                    )
                )
            )
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quotes' AND policyname = 'Users can delete quotes from their organization') THEN
        CREATE POLICY "Users can delete quotes from their organization" 
        ON public.quotes FOR DELETE 
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p 
                WHERE p.id = auth.uid() 
                AND (
                    p.role IN ('org_owner', 'tour_operator')
                    OR (
                        p.role = 'agent' 
                        AND quotes.created_by = auth.uid()::text
                    )
                )
            )
        );
    END IF;
    
EXCEPTION
    WHEN duplicate_object THEN
        NULL; -- Ignore if policies already exist
END $$;
