export async function GET({ platform, url }) {
  try {
    const templateType = url.searchParams.get('type') || 'confirmation';
    
    const template = await platform.env.RSVPS.prepare(
      'SELECT * FROM email_templates WHERE template_type = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(templateType).first();

    return new Response(JSON.stringify({ 
      template: template?.template || '',
      templateType: templateType
    }), {
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
    const { template, templateType } = await request.json();

    if (!template) {
      return new Response(JSON.stringify({ error: 'Template is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!templateType || !['confirmation', 'blast'].includes(templateType)) {
      return new Response(JSON.stringify({ error: 'Valid template type is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update existing template of this type or insert new one
    const existingTemplate = await platform.env.RSVPS.prepare(
      'SELECT id FROM email_templates WHERE template_type = ?'
    ).bind(templateType).first();

    let result;
    if (existingTemplate) {
      // Update existing template
      result = await platform.env.RSVPS.prepare(
        'UPDATE email_templates SET template = ?, created_at = CURRENT_TIMESTAMP WHERE template_type = ?'
      )
        .bind(template, templateType)
        .run();
    } else {
      // Insert new template
      result = await platform.env.RSVPS.prepare(
        'INSERT INTO email_templates (template, template_type) VALUES (?, ?)'
      )
        .bind(template, templateType)
        .run();
    }

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
