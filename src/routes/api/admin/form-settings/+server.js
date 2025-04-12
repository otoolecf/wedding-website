import { json } from '@sveltejs/kit';

export async function GET({ platform }) {
  try {
    const settings = await platform.env.RSVPS.prepare(
      'SELECT * FROM form_settings WHERE id = 1'
    ).first();

    return json(
      settings || {
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
      }
    );
  } catch (error) {
    console.error('Error fetching form settings:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch form settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request, platform }) {
  try {
    const settings = await request.json();

    await platform.env.RSVPS.prepare(
      `
      INSERT OR REPLACE INTO form_settings (
        id,
        nameLabel,
        emailLabel,
        attendanceQuestion,
        additionalGuestsLabel,
        vegetarianQuestion,
        foodAllergiesLabel,
        lodgingQuestion,
        transportQuestion,
        songRequestLabel,
        specialNotesLabel
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
      .bind(
        settings.nameLabel,
        settings.emailLabel,
        settings.attendanceQuestion,
        settings.additionalGuestsLabel,
        settings.vegetarianQuestion,
        settings.foodAllergiesLabel,
        settings.lodgingQuestion,
        settings.transportQuestion,
        settings.songRequestLabel,
        settings.specialNotesLabel
      )
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving form settings:', error);
    return new Response(JSON.stringify({ error: 'Failed to save form settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
