export async function sendRsvpConfirmationEmail(rsvpData, platform) {
  // Get the latest email template
  const templateResult = await platform.env.RSVPS.prepare(
    'SELECT template FROM email_templates ORDER BY created_at DESC LIMIT 1'
  ).first();

  // Get form settings for field labels
  const settingsResult = await platform.env.RSVPS.prepare(
    'SELECT settings FROM form_settings ORDER BY created_at DESC LIMIT 1'
  ).first();
  const settings = settingsResult?.settings ? JSON.parse(settingsResult.settings) : {};

  // Get partner information if this is a primary guest
  let partnerInfo = null;
  if (rsvpData.is_primary) {
    const partnerResult = await platform.env.RSVPS.prepare(
      'SELECT * FROM rsvps WHERE name = ? AND is_primary = false'
    )
      .bind(rsvpData.name)
      .first();
    partnerInfo = partnerResult || null;
  }

  // Generate the form data section
  let formDataSection = `
    <div class="rsvp-summary">
      <h3>Your Information</h3>
      <ul>
        <li><strong>${settings.nameLabel || 'Name'}:</strong> ${rsvpData.name}</li>
        <li><strong>${settings.emailLabel || 'Email'}:</strong> ${rsvpData.email}</li>
        <li><strong>${settings.attendanceQuestion || 'Will you be attending?'}:</strong> ${rsvpData.attending === 'yes' ? 'Yes' : 'No'}</li>
        ${
          rsvpData.attending === 'yes'
            ? `
          <li><strong>${settings.vegetarianQuestion || 'Are you vegetarian?'}:</strong> ${rsvpData.is_vegetarian === 'yes' ? 'Yes' : 'No'}</li>
          <li><strong>${settings.foodAllergiesLabel || 'Any food allergies?'}:</strong> ${rsvpData.food_allergies || 'None'}</li>
          <li><strong>${settings.lodgingQuestion || 'Are you planning on staying at the lodging?'}:</strong> ${rsvpData.lodging === 'yes' ? 'Yes' : 'No'}</li>
          <li><strong>${settings.transportQuestion || 'Are you planning on joining the transport?'}:</strong> ${rsvpData.using_transport === 'yes' ? 'Yes' : 'No'}</li>
          <li><strong>${settings.songRequestLabel || 'What song will get you on the dance floor?'}:</strong> ${rsvpData.song || 'None'}</li>
          <li><strong>${settings.specialNotesLabel || 'Any special note for the couple?'}:</strong> ${rsvpData.special_notes || 'None'}</li>
        `
            : ''
        }
      </ul>
      ${
        partnerInfo
          ? `
        <h3>Partner's Information</h3>
        <ul>
          <li><strong>${settings.nameLabel || 'Name'}:</strong> ${partnerInfo.name}</li>
          <li><strong>${settings.emailLabel || 'Email'}:</strong> ${partnerInfo.email}</li>
          <li><strong>${settings.attendanceQuestion || 'Will they be attending?'}:</strong> ${partnerInfo.attending === 'yes' ? 'Yes' : 'No'}</li>
          ${
            partnerInfo.attending === 'yes'
              ? `
            <li><strong>${settings.vegetarianQuestion || 'Are they vegetarian?'}:</strong> ${partnerInfo.is_vegetarian === 'yes' ? 'Yes' : 'No'}</li>
            <li><strong>${settings.foodAllergiesLabel || 'Any food allergies?'}:</strong> ${partnerInfo.food_allergies || 'None'}</li>
            <li><strong>${settings.lodgingQuestion || 'Are they planning on staying at the lodging?'}:</strong> ${partnerInfo.lodging === 'yes' ? 'Yes' : 'No'}</li>
            <li><strong>${settings.transportQuestion || 'Are they planning on joining the transport?'}:</strong> ${partnerInfo.using_transport === 'yes' ? 'Yes' : 'No'}</li>
            <li><strong>${settings.songRequestLabel || 'What song will get them on the dance floor?'}:</strong> ${partnerInfo.song || 'None'}</li>
            <li><strong>${settings.specialNotesLabel || 'Any special note for the couple?'}:</strong> ${partnerInfo.special_notes || 'None'}</li>
          `
              : ''
          }
        </ul>
      `
          : ''
      }
    </div>
  `;

  // Default template if none is configured
  let emailContent =
    templateResult?.template ||
    `
    <h2>Thank you for your RSVP!</h2>
    <p>Here's a summary of your response:</p>
    ${formDataSection}
    <p>If you need to make any changes to your RSVP, please contact us directly.</p>
    <p>We look forward to celebrating with you!</p>
  `;

  // Replace the form data placeholder with the actual form data
  emailContent = emailContent.replace(/\${form_data}/g, formDataSection);

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
