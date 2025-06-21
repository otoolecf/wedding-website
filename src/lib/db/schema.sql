DROP TABLE IF EXISTS rsvps;
CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  attending TEXT NOT NULL,
  guests INTEGER,
  dietary_requirements TEXT,
  song TEXT,
  guest_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guest_list(id)
);

-- Create an index on email for faster lookups
CREATE INDEX idx_rsvps_email ON rsvps(email);

-- Create an index on created_at for faster sorting
CREATE INDEX idx_rsvps_created_at ON rsvps(created_at);

-- Create an index on guest_id for faster lookups
CREATE INDEX idx_rsvps_guest_id ON rsvps(guest_id);

-- Create guest list table
DROP TABLE IF EXISTS guest_list;
CREATE TABLE guest_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  partner_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on name for faster lookups
CREATE INDEX idx_guest_list_name ON guest_list(name);

-- Create an index on partner_name for faster lookups
CREATE INDEX idx_guest_list_partner_name ON guest_list(partner_name);

-- Create an index on email for faster lookups
CREATE INDEX idx_guest_list_email ON guest_list(email);