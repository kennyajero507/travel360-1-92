
-- Add client_email column to the quotes table to store the client's email for sending quotes
ALTER TABLE public.quotes
ADD COLUMN client_email TEXT;
