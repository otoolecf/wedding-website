export async function sendRsvpConfirmationEmail(rsvpData, platform) {
  const emailContent = `
    <h2>Thank you for your RSVP!</h2>
    <p>Here's a summary of your response:</p>
    <ul>
      <li><strong>Name:</strong> ${rsvpData.name}</li>
      <li><strong>Attending:</strong> ${rsvpData.attending === 'yes' ? 'Yes' : 'No'}</li>
      ${
        rsvpData.attending === 'yes'
          ? `
        <li><strong>Vegetarian:</strong> ${rsvpData.is_vegetarian === 'yes' ? 'Yes' : 'No'}</li>
        <li><strong>Food Allergies:</strong> ${rsvpData.food_allergies || 'None'}</li>
        <li><strong>Staying at Lodging:</strong> ${rsvpData.lodging === 'yes' ? 'Yes' : 'No'}</li>
        <li><strong>Using Transport:</strong> ${rsvpData.using_transport === 'yes' ? 'Yes' : 'No'}</li>
        <li><strong>Song Request:</strong> ${rsvpData.song || 'None'}</li>
        <li><strong>Special Notes:</strong> ${rsvpData.special_notes || 'None'}</li>
      `
          : ''
      }
    </ul>
    <p>If you need to make any changes to your RSVP, please contact us directly.</p>
    <p>We look forward to celebrating with you!</p>
  `;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-key': platform.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: {
        name: platform.env.EMAIL_SENDER_NAME,
        email: platform.env.EMAIL_SENDER_ADDRESS
      },
      to: [
        {
          email: rsvpData.email,
          name: rsvpData.name
        }
      ],
      subject: 'RSVP Confirmation - Connor & Colette Wedding',
      htmlContent: emailContent
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return response.json();
}
