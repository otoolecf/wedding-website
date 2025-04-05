export async function GET({ platform }) {
  try {
    const template = await platform.env.RSVPS.prepare(
      'SELECT * FROM email_templates ORDER BY created_at DESC LIMIT 1'
    ).first();

    return new Response(JSON.stringify({ template: template?.template || '' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching email template:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch email template' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request, platform }) {
  try {
    const { template } = await request.json();

    if (!template) {
      return new Response(JSON.stringify({ error: 'Template is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert new template
    const result = await platform.env.RSVPS.prepare(
      'INSERT INTO email_templates (template) VALUES (?)'
    )
      .bind(template)
      .run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to save template' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error saving email template:', error);
    return new Response(JSON.stringify({ error: 'Failed to save email template' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
