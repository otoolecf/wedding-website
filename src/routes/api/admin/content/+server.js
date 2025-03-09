// src/routes/api/admin/content/+server.js

// GET handler to fetch all content sections
export async function GET({ request, platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Content sections request received`);

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Validate JWT in production
  const isDevelopment =
    platform.env?.ENVIRONMENT !== 'production' && platform.env?.ENVIRONMENT !== 'preview';
  if (!isDevelopment) {
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!jwt) {
      console.error(`[${requestId}] Unauthorized access attempt`);
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
  }

  try {
    // Fetch all content sections from KV
    const contentList = await platform.env.IMAGES_KV.get('content_sections_list');
    let sectionKeys = contentList ? JSON.parse(contentList) : [];

    // Fetch each section's data
    const fetchPromises = sectionKeys.map(async (key) => {
      const sectionData = await platform.env.IMAGES_KV.get(`content:${key}`);
      return sectionData ? JSON.parse(sectionData) : null;
    });

    const sections = (await Promise.all(fetchPromises)).filter((section) => section !== null);

    // Sort sections by title
    sections.sort((a, b) => a.title.localeCompare(b.title));

    console.log(`[${requestId}] Retrieved ${sections.length} content sections`);
    return jsonResponse({ sections });
  } catch (error) {
    console.error(`[${requestId}] Error fetching content sections:`, error);
    return jsonResponse({ error: 'Failed to fetch content sections' }, 500);
  }
}

// POST handler to create a new content section
export async function POST({ request, platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] New content section request received`);

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Validate JWT in production
  const isDevelopment =
    platform.env?.ENVIRONMENT !== 'production' && platform.env?.ENVIRONMENT !== 'preview';
  if (!isDevelopment) {
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!jwt) {
      console.error(`[${requestId}] Unauthorized access attempt`);
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.key || !data.title) {
      return jsonResponse({ error: 'Key and title are required' }, 400);
    }

    // Validate key format (only lowercase letters, numbers, and underscores)
    if (!/^[a-z0-9_]+$/.test(data.key)) {
      return jsonResponse(
        {
          error: 'Section key must contain only lowercase letters, numbers, and underscores'
        },
        400
      );
    }

    // Check if section already exists
    const existingSection = await platform.env.IMAGES_KV.get(`content:${data.key}`);
    if (existingSection) {
      return jsonResponse({ error: 'A section with this key already exists' }, 409);
    }

    // Create the section object
    const section = {
      key: data.key,
      title: data.title,
      content: data.content || '<p>Empty section</p>',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save to KV
    await platform.env.IMAGES_KV.put(`content:${data.key}`, JSON.stringify(section));

    // Update the list of sections
    const contentList = await platform.env.IMAGES_KV.get('content_sections_list');
    let sectionKeys = contentList ? JSON.parse(contentList) : [];
    sectionKeys.push(data.key);
    await platform.env.IMAGES_KV.put('content_sections_list', JSON.stringify(sectionKeys));

    console.log(`[${requestId}] Created new content section: ${data.key}`);
    return jsonResponse(
      {
        message: 'Content section created successfully',
        section
      },
      201
    );
  } catch (error) {
    console.error(`[${requestId}] Error creating content section:`, error);
    return jsonResponse({ error: 'Failed to create content section' }, 500);
  }
}

// PUT handler to update an existing content section
export async function PUT({ request, platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Content section update request received`);

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Validate JWT in production
  const isDevelopment =
    platform.env?.ENVIRONMENT !== 'production' && platform.env?.ENVIRONMENT !== 'preview';
  if (!isDevelopment) {
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!jwt) {
      console.error(`[${requestId}] Unauthorized access attempt`);
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.key) {
      return jsonResponse({ error: 'Section key is required' }, 400);
    }

    // Check if section exists
    const existingSection = await platform.env.IMAGES_KV.get(`content:${data.key}`);
    if (!existingSection) {
      return jsonResponse({ error: 'Content section not found' }, 404);
    }

    const existing = JSON.parse(existingSection);

    // Update the section object
    const updatedSection = {
      ...existing,
      title: data.title || existing.title,
      content: data.content || existing.content,
      updated_at: new Date().toISOString()
    };

    // Save to KV
    await platform.env.IMAGES_KV.put(`content:${data.key}`, JSON.stringify(updatedSection));

    console.log(`[${requestId}] Updated content section: ${data.key}`);
    return jsonResponse({
      message: 'Content section updated successfully',
      section: updatedSection
    });
  } catch (error) {
    console.error(`[${requestId}] Error updating content section:`, error);
    return jsonResponse({ error: 'Failed to update content section' }, 500);
  }
}

// src/routes/api/admin/content/[key]/+server.js
export async function DELETE({ request, params, platform }) {
  const requestId = crypto.randomUUID();
  const { key } = params;
  console.log(`[${requestId}] Content section delete request received for key: ${key}`);

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Validate JWT in production
  const isDevelopment =
    platform.env?.ENVIRONMENT !== 'production' && platform.env?.ENVIRONMENT !== 'preview';
  if (!isDevelopment) {
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!jwt) {
      console.error(`[${requestId}] Unauthorized access attempt`);
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
  }

  try {
    // Check if section exists
    const existingSection = await platform.env.IMAGES_KV.get(`content:${key}`);
    if (!existingSection) {
      return jsonResponse({ error: 'Content section not found' }, 404);
    }

    // Delete from KV
    await platform.env.IMAGES_KV.delete(`content:${key}`);

    // Update the list of sections
    const contentList = await platform.env.IMAGES_KV.get('content_sections_list');
    let sectionKeys = contentList ? JSON.parse(contentList) : [];
    sectionKeys = sectionKeys.filter((k) => k !== key);
    await platform.env.IMAGES_KV.put('content_sections_list', JSON.stringify(sectionKeys));

    console.log(`[${requestId}] Deleted content section: ${key}`);
    return jsonResponse({
      message: 'Content section deleted successfully'
    });
  } catch (error) {
    console.error(`[${requestId}] Error deleting content section:`, error);
    return jsonResponse({ error: 'Failed to delete content section' }, 500);
  }
}
