import { writable } from 'svelte/store';

const defaultSettings = {
  nameLabel: 'Full Name',
  emailLabel: 'Email',
  attendanceQuestion: 'Will you be attending?',
  additionalGuestsLabel: 'Number of Additional Guests',
  vegetarianQuestion: 'Are you vegetarian?',
  foodAllergiesLabel: 'Any food allergies?',
  lodgingQuestion: 'Are you planning on staying at the lodging?',
  transportQuestion: 'Are you planning on joining the transport to and from our lodging?',
  songRequestLabel: 'What song will get you on the dance floor?',
  specialNotesLabel: 'Any special note for the couple?'
};

export const formSettings = writable(defaultSettings);

// Function to load settings from the server
export async function loadFormSettings() {
  try {
    const response = await fetch('/api/admin/form-settings');
    if (response.ok) {
      const settings = await response.json();
      formSettings.set(settings);
    }
  } catch (error) {
    console.error('Failed to load form settings:', error);
  }
}

// Function to save settings to the server
export async function saveFormSettings(settings) {
  try {
    const response = await fetch('/api/admin/form-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    if (response.ok) {
      formSettings.set(settings);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to save form settings:', error);
    return false;
  }
}
