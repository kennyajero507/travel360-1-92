
-- Add missing columns to the quotes table as expected by quoteHotelOptionsService.ts
ALTER TABLE public.quotes 
  ADD COLUMN IF NOT EXISTS selected_hotel_option_id UUID,
  ADD COLUMN IF NOT EXISTS client_selection_date TIMESTAMPTZ;

-- (Optional: add index for faster lookups if required)
-- CREATE INDEX IF NOT EXISTS idx_quotes_selected_hotel_option_id ON public.quotes(selected_hotel_option_id);
