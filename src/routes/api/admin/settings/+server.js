import { json } from '@sveltejs/kit';

// Default settings if none exist in KV
const defaultSettings = {
  weddingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  weddingTime: '16:00',
  venueName: 'Wedding Venue',
  venueAddress: '123 Wedding Street, City, State ZIP',
  groomName: "Groom's Name",
  brideName: "Bride's Name",
  showCountdown: true,
  nameOrder: 'groom-first', // 'groom-first' or 'bride-first'
  rsvpButtonText: 'RSVP Now',
  rsvpButtonLink: '/rsvp'
};

export async function GET({ platform }) {
  try {
    // Try to get settings from KV
    const settings = await platform.env.IMAGES_KV.get('wedding_settings', 'json');

    // If no settings exist, return defaults
    if (!settings) {
      return json({ settings: defaultSettings });
    }

    return json({ settings });
  } catch (err) {
    console.error('Error getting settings:', err);
    return json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function POST({ request, platform }) {
  try {
    const newSettings = await request.json();

    // Validate required fields
    const requiredFields = [
      'weddingDate',
      'weddingTime',
      'venueName',
      'venueAddress',
      'groomName',
      'brideName',
      'showCountdown',
      'nameOrder',
      'rsvpButtonText',
      'rsvpButtonLink'
    ];

    for (const field of requiredFields) {
      if (!newSettings[field]) {
        return json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Validate nameOrder
    if (!['groom-first', 'bride-first'].includes(newSettings.nameOrder)) {
      return json({ error: 'Invalid name order value' }, { status: 400 });
    }

    // Save to KV
    await platform.env.IMAGES_KV.put('wedding_settings', JSON.stringify(newSettings));

    return json({ settings: newSettings });
  } catch (err) {
    console.error('Error saving settings:', err);
    return json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
