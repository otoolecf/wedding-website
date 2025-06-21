-- Add subject column to email_templates table
ALTER TABLE email_templates ADD COLUMN subject TEXT;

-- Update existing templates with default subjects
UPDATE email_templates SET subject = 'RSVP Confirmation' WHERE template_type = 'confirmation';
UPDATE email_templates SET subject = 'Wedding Update' WHERE template_type = 'blast'; 