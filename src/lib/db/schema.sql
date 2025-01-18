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