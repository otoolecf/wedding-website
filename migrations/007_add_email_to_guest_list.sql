-- Add email column to guest_list table
ALTER TABLE guest_list ADD COLUMN email TEXT;

-- Create an index on email for faster lookups
CREATE INDEX idx_guest_list_email ON guest_list(email); 