-- Add new columns to rsvps table
ALTER TABLE rsvps ADD COLUMN is_vegetarian TEXT;
ALTER TABLE rsvps ADD COLUMN food_allergies TEXT;
ALTER TABLE rsvps ADD COLUMN lodging TEXT;
ALTER TABLE rsvps ADD COLUMN using_transport TEXT;
ALTER TABLE rsvps ADD COLUMN special_notes TEXT; 