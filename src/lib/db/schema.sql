DROP TABLE IF EXISTS rsvps;
CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  attending TEXT NOT NULL,
  guests INTEGER,
  dietary_requirements TEXT,
  song TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on email for faster lookups
CREATE INDEX idx_rsvps_email ON rsvps(email);

-- Create an index on created_at for faster sorting
CREATE INDEX idx_rsvps_created_at ON rsvps(created_at);

-- Create guest list table
DROP TABLE IF EXISTS guest_list;
CREATE TABLE guest_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  partner_name TEXT,
  plus_one_allowed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on name for faster lookups
CREATE INDEX idx_guest_list_name ON guest_list(name);

-- Create an index on partner_name for faster lookups
CREATE INDEX idx_guest_list_partner_name ON guest_list(partner_name);