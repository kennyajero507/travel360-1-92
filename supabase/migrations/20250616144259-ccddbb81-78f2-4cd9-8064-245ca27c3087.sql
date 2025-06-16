
-- Add client_email column to the bookings table
ALTER TABLE public.bookings
ADD COLUMN client_email TEXT;
