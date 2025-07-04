export async function buildRsvpEmailContent(
  rsvpData,
  platform,
  templateOverride = null,
  templateType = 'confirmation'
) {
  console.log('Building RSVP email content for:', rsvpData.name, 'with template type:', templateType);

  // Get the template for the specified type if not provided
  let templateResult = null;
  if (!templateOverride) {
    console.log('Fetching email template for type:', templateType);
    templateResult = await platform.env.RSVPS.prepare(
      'SELECT template FROM email_templates WHERE template_type = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(templateType).first();
    console.log('Template result:', templateResult);
  }


  // Get form settings for field labels
  console.log('Fetching form settings...');
  const settingsResult = await platform.env.RSVPS.prepare(
    'SELECT * FROM form_settings WHERE id = 1'
  ).first();
  console.log('Settings result:', settingsResult);

  // Use default settings if none are found
  const settings = settingsResult || {
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
  console.log('Using settings:', settings);

  // Check if this is a primary guest (their name is in the guest_list table's name column)
  console.log('Checking if guest is primary...');
  const guestCheck = await platform.env.RSVPS.prepare(
    'SELECT * FROM guest_list WHERE LOWER(name) = LOWER(?)'
  )
    .bind(rsvpData.name)
    .first();
  console.log('Guest check result:', guestCheck);

  // Get partner information if this is a primary guest
  let partnerInfo = null;
  if (guestCheck) {
    console.log('Fetching partner information for primary guest...');
    if (guestCheck.partner_name) {
      const partnerResult = await platform.env.RSVPS.prepare(
        'SELECT * FROM rsvps WHERE LOWER(name) = LOWER(?)'
      )
        .bind(guestCheck.partner_name)
        .first();
      console.log('Partner result:', partnerResult);
      partnerInfo = partnerResult || null;
    }
  }

  // Generate the form data section
  console.log('Generating form data section...');
  let formDataSection = `
    <div class="rsvp-summary">
      <h3>Your Information</h3>
      <ul>
        <li><strong>${settings.nameLabel}:</strong> ${rsvpData.name}</li>
        <li><strong>${settings.emailLabel}:</strong> ${rsvpData.email}</li>
        <li><strong>${settings.attendanceQuestion}:</strong> ${rsvpData.attending === 'yes' ? 'Yes' : 'No'}</li>
        ${
          rsvpData.attending === 'yes'
            ? `
          <li><strong>${settings.vegetarianQuestion}:</strong> ${rsvpData.is_vegetarian === 'yes' ? 'Yes' : 'No'}</li>
          <li><strong>${settings.foodAllergiesLabel}:</strong> ${rsvpData.food_allergies || 'None'}</li>
          <li><strong>${settings.lodgingQuestion}:</strong> ${rsvpData.lodging === 'yes' ? 'Yes' : 'No'}</li>
          <li><strong>${settings.transportQuestion}:</strong> ${rsvpData.using_transport === 'yes' ? 'Yes' : 'No'}</li>
          <li><strong>${settings.songRequestLabel}:</strong> ${rsvpData.song || 'None'}</li>
          <li><strong>${settings.specialNotesLabel}:</strong> ${rsvpData.special_notes || 'None'}</li>
        `
            : ''
        }
      </ul>
      
      ${
        partnerInfo
          ? `
        <h3>Partner's Information</h3>
        <ul>
          <li><strong>${settings.nameLabel}:</strong> ${partnerInfo.name}</li>
          <li><strong>${settings.attendanceQuestion}:</strong> ${partnerInfo.attending === 'yes' ? 'Yes' : 'No'}</li>
          ${
            partnerInfo.attending === 'yes'
              ? `
            <li><strong>${settings.vegetarianQuestion}:</strong> ${partnerInfo.is_vegetarian === 'yes' ? 'Yes' : 'No'}</li>
            <li><strong>${settings.foodAllergiesLabel}:</strong> ${partnerInfo.food_allergies || 'None'}</li>
            <li><strong>${settings.lodgingQuestion}:</strong> ${partnerInfo.lodging === 'yes' ? 'Yes' : 'No'}</li>
            <li><strong>${settings.transportQuestion}:</strong> ${partnerInfo.using_transport === 'yes' ? 'Yes' : 'No'}</li>
            <li><strong>${settings.songRequestLabel}:</strong> ${partnerInfo.song || 'None'}</li>
            <li><strong>${settings.specialNotesLabel}:</strong> ${partnerInfo.special_notes || 'None'}</li>
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
  console.log('Preparing email content...');
  let emailContent =
    templateOverride ||
    templateResult?.template ||
    `
    <h2>Thank you for your RSVP!</h2>
    <p>Here's a summary of your response:</p>
    [[form_data]]
    <p>If you need to make any changes to your RSVP, please contact us directly.</p>
    <p>We look forward to celebrating with you!</p>
  `;
  console.log('Email content before form data replacement:', emailContent);

  // Replace the form data placeholder with the actual form data
  emailContent = emailContent.replace(/\[\[form_data\]\]/g, formDataSection);
  console.log('Final email content:', emailContent);

  return emailContent;
}

export async function sendRsvpConfirmationEmail(rsvpData, platform, overrideEmail = null, templateOverride = null, subjectOverride = null) {
  console.log('Starting email send process for RSVP:', {
    name: rsvpData.name,
    email: overrideEmail || rsvpData.email
  });

  const emailContent = await buildRsvpEmailContent(rsvpData, platform, templateOverride, 'confirmation');

  // Get the subject line from the template or use override
  let subject = 'RSVP Confirmation'; // Default subject
  if (subjectOverride) {
    subject = subjectOverride;
  } else if (!templateOverride) {
    const templateResult = await platform.env.RSVPS.prepare(
      'SELECT subject FROM email_templates WHERE template_type = ? ORDER BY created_at DESC LIMIT 1'
    ).bind('confirmation').first();
    if (templateResult?.subject) {
      subject = templateResult.subject;
    }
  }

  console.log('Sending email via Brevo API...');
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
          email: overrideEmail || rsvpData.email,
          name: rsvpData.name
        }
      ],
      subject: subject,
      htmlContent: emailContent
    })
  });

  console.log('Brevo API response status:', response.status);
  const responseData = await response.json();
  console.log('Brevo API response:', responseData);

  if (!response.ok) {
    throw new Error(`Failed to send email: ${responseData.message}`);
  }

  return responseData;
}

export async function sendEmailBlast(platform, templateOverride = null, subjectOverride = null) {
  const results = await platform.env.RSVPS.prepare(
    "SELECT * FROM guest_list WHERE email IS NOT NULL AND email <> ''"
  ).all();

  let sent = 0;
  for (const guest of results.results) {
    try {
      await sendBlastEmail(guest, platform, null, templateOverride, subjectOverride);
      sent++;
    } catch (err) {
      console.error('Failed to send email to', guest.email, err);
    }
  }

  return { total: results.results.length, sent };
}

export async function sendBlastEmail(rsvpData, platform, overrideEmail = null, templateOverride = null, subjectOverride = null) {
  console.log('Starting blast email send process for:', {
    name: rsvpData.name,
    email: overrideEmail || rsvpData.email
  });

  // For blast emails, we don't include form data - just use the template as-is
  let emailContent;
  let subject = 'Wedding Update'; // Default subject
  
  if (templateOverride) {
    emailContent = templateOverride;
  } else {
    const templateResult = await platform.env.RSVPS.prepare(
      'SELECT template, subject FROM email_templates WHERE template_type = ? ORDER BY created_at DESC LIMIT 1'
    ).bind('blast').first();
    
    emailContent = templateResult?.template || `
      <h2>Important Wedding Update</h2>
      <p>Dear Wedding Guests,</p>
      
      <p>We wanted to share some important information about our upcoming wedding celebration.</p>
      
      <p>Please feel free to reach out if you have any questions.</p>
      
      <p>Looking forward to celebrating with you!</p>
      <p>Connor & Colette</p>
    `;
    
    if (templateResult?.subject) {
      subject = templateResult.subject;
    }
  }

  // Use subject override if provided
  if (subjectOverride) {
    subject = subjectOverride;
  }

  console.log('Sending blast email via Brevo API...');
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
          email: overrideEmail || rsvpData.email,
          name: rsvpData.name
        }
      ],
      subject: subject,
      htmlContent: emailContent
    })
  });

  console.log('Brevo API response status:', response.status);
  const responseData = await response.json();
  console.log('Brevo API response:', responseData);

  if (!response.ok) {
    throw new Error(`Failed to send email: ${responseData.message}`);
  }

  return responseData;
}

