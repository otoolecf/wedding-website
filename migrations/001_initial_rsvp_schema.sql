-- Drop existing tables if they exist
DROP TABLE IF EXISTS rsvps;
DROP TABLE IF EXISTS guest_list;
DROP TABLE IF EXISTS form_settings;
DROP TABLE IF EXISTS email_templates;

-- Create rsvps table
CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  attending TEXT NOT NULL,
  guests INTEGER DEFAULT 0,
  is_vegetarian TEXT DEFAULT 'no',
  food_allergies TEXT,
  lodging TEXT DEFAULT 'no',
  using_transport TEXT DEFAULT 'no',
  song TEXT,
  special_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name)
);

-- Create guest_list table
CREATE TABLE guest_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  partner_name TEXT,
  plus_one_allowed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create form_settings table
CREATE TABLE form_settings (
  id INTEGER PRIMARY KEY,
  nameLabel TEXT DEFAULT 'Full Name',
  emailLabel TEXT DEFAULT 'Email',
  attendanceQuestion TEXT DEFAULT 'Will you be attending?',
  additionalGuestsLabel TEXT DEFAULT 'Number of Additional Guests',
  vegetarianQuestion TEXT DEFAULT 'Are you vegetarian?',
  foodAllergiesLabel TEXT DEFAULT 'Any food allergies?',
  lodgingQuestion TEXT DEFAULT 'Are you planning on staying at the lodging?',
  transportQuestion TEXT DEFAULT 'Are you planning on joining the transport to and from our lodging?',
  songRequestLabel TEXT DEFAULT 'What song will get you on the dance floor?',
  specialNotesLabel TEXT DEFAULT 'Any special note for the couple?'
);

-- Create email_templates table
CREATE TABLE email_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default form settings
INSERT INTO form_settings (id) VALUES (1); 