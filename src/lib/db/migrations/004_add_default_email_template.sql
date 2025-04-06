-- Add default email template
INSERT INTO email_templates (template) VALUES (
  '<h2>Thank you for your RSVP!</h2>
  <p>Here''s a summary of your response:</p>
  
  \${form_data}
  
  <p>If you need to make any changes to your RSVP, please contact us directly.</p>
  <p>We look forward to celebrating with you!</p>'
); 