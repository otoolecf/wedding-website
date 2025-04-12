-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 