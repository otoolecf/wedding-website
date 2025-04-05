-- Create form_settings table
CREATE TABLE IF NOT EXISTS form_settings (
  id INTEGER PRIMARY KEY,
  nameLabel TEXT NOT NULL,
  emailLabel TEXT NOT NULL,
  attendanceQuestion TEXT NOT NULL,
  additionalGuestsLabel TEXT NOT NULL,
  vegetarianQuestion TEXT NOT NULL,
  foodAllergiesLabel TEXT NOT NULL,
  lodgingQuestion TEXT NOT NULL,
  transportQuestion TEXT NOT NULL,
  songRequestLabel TEXT NOT NULL,
  specialNotesLabel TEXT NOT NULL
); 