-- Add template_type column to email_templates table (if it doesn't exist)
ALTER TABLE email_templates ADD COLUMN template_type TEXT DEFAULT 'confirmation';

-- Update existing templates to be confirmation type
UPDATE email_templates SET template_type = 'confirmation' WHERE template_type IS NULL;

-- Keep only the most recent template and mark it as confirmation
DELETE FROM email_templates WHERE id NOT IN (
  SELECT id FROM email_templates ORDER BY created_at DESC LIMIT 1
);

-- Insert default blast template (only if it doesn't exist)
INSERT OR IGNORE INTO email_templates (template, template_type) VALUES (
  '<h2>Important Wedding Update</h2>
  <p>Dear Wedding Guests,</p>
  
  <p>We wanted to share some important information about our upcoming wedding celebration.</p>
  
  <p>Please feel free to reach out if you have any questions.</p>
  
  <p>Looking forward to celebrating with you!</p>
  <p>Connor & Colette</p>',
  'blast'
);

-- Create unique constraint on template_type to ensure only one template per type
CREATE UNIQUE INDEX idx_email_templates_type ON email_templates(template_type); 