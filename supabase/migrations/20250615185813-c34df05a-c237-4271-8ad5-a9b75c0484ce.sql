
-- Add new fields to the inquiries table for enhanced international/domestic tour support
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS visa_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS passport_expiry_date DATE,
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS flight_preference VARCHAR(20),
ADD COLUMN IF NOT EXISTS travel_insurance_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS regional_preference VARCHAR(50),
ADD COLUMN IF NOT EXISTS transport_mode_preference VARCHAR(20),
ADD COLUMN IF NOT EXISTS guide_language_preference VARCHAR(20),
ADD COLUMN IF NOT EXISTS estimated_budget_range VARCHAR(50),
ADD COLUMN IF NOT EXISTS special_requirements TEXT,
ADD COLUMN IF NOT EXISTS document_checklist JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS workflow_stage VARCHAR(50) DEFAULT 'initial';

-- Add comments to document the new fields
COMMENT ON COLUMN public.inquiries.visa_required IS 'Whether visa is required for international tours';
COMMENT ON COLUMN public.inquiries.passport_expiry_date IS 'Passport expiry date for international tours';
COMMENT ON COLUMN public.inquiries.preferred_currency IS 'Preferred currency for pricing (international tours)';
COMMENT ON COLUMN public.inquiries.flight_preference IS 'Flight preference: direct, connecting, economy, business';
COMMENT ON COLUMN public.inquiries.travel_insurance_required IS 'Whether travel insurance is required';
COMMENT ON COLUMN public.inquiries.regional_preference IS 'Regional preference for domestic tours';
COMMENT ON COLUMN public.inquiries.transport_mode_preference IS 'Preferred transport mode for domestic tours';
COMMENT ON COLUMN public.inquiries.guide_language_preference IS 'Preferred language for local guide';
COMMENT ON COLUMN public.inquiries.estimated_budget_range IS 'Estimated budget range for the tour';
COMMENT ON COLUMN public.inquiries.special_requirements IS 'Special requirements or requests';
COMMENT ON COLUMN public.inquiries.document_checklist IS 'JSON array of required documents';
COMMENT ON COLUMN public.inquiries.workflow_stage IS 'Current stage in the inquiry workflow';
