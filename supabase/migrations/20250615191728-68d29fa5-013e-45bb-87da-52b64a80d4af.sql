
-- Add missing columns to quotes table for enhanced international/domestic tour functionality
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS visa_required boolean DEFAULT false;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS passport_expiry_date date;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS preferred_currency character varying DEFAULT 'USD';
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS flight_preference character varying;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS travel_insurance_required boolean DEFAULT false;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS regional_preference character varying;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS transport_mode_preference character varying;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS guide_language_preference character varying;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS estimated_budget_range character varying;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS special_requirements text;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS document_checklist jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS workflow_stage character varying DEFAULT 'initial';
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS visa_documentation jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS itinerary jsonb DEFAULT '[]'::jsonb;

-- Update existing quotes to have proper default values for new columns
UPDATE public.quotes 
SET 
  visa_required = COALESCE(visa_required, false),
  travel_insurance_required = COALESCE(travel_insurance_required, false),
  preferred_currency = COALESCE(preferred_currency, 'USD'),
  document_checklist = COALESCE(document_checklist, '[]'::jsonb),
  workflow_stage = COALESCE(workflow_stage, 'initial'),
  visa_documentation = COALESCE(visa_documentation, '[]'::jsonb),
  itinerary = COALESCE(itinerary, '[]'::jsonb)
WHERE 
  visa_required IS NULL 
  OR travel_insurance_required IS NULL 
  OR preferred_currency IS NULL 
  OR document_checklist IS NULL 
  OR workflow_stage IS NULL 
  OR visa_documentation IS NULL 
  OR itinerary IS NULL;
