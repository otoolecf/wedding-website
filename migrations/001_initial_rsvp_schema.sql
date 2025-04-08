-- Drop existing table if it exists
DROP TABLE IF EXISTS rsvps;

-- Create new table with proper structure
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