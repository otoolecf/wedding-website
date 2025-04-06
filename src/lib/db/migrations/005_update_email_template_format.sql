-- Update existing email templates to use the new format
UPDATE email_templates 
SET template = REPLACE(template, '\[[form_data]]', '[[form_data]]')
WHERE template LIKE '%\[[form_data]]%'; 