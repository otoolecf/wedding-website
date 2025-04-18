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
  restrictToHomePage: true,
  nameOrder: 'groom-first', // 'groom-first' or 'bride-first'
  rsvpButtonText: 'RSVP Now',
  rsvpButtonLink: '/rsvp',
  registries: {
    externalRegistries: [
      {
        name: 'Target',
        url: 'https://www.target.com/gift-registry/',
        image: 'https://picsum.photos/seed/target/400/200',
        description: 'Home essentials and decor'
      },
      {
        name: 'Amazon',
        url: 'https://www.amazon.com/wedding',
        image: 'https://picsum.photos/seed/amazon/400/200',
        description: 'Everything under the sun'
      }
    ],
    honeymoonFund: {
      enabled: true,
      title: 'Honeymoon Fund',
      description:
        "If you'd prefer to contribute to our honeymoon adventures, we've set up a honeymoon fund.",
      buttonText: 'Contribute to Our Honeymoon',
      venmoUsername: '', // Will be hidden from crawlers
      showVenmo: false // Controls whether Venmo info is visible
    }
  },
  defaultPages: [
    { id: 'home', name: 'Home', slug: '', order: 0 },
    { id: 'gallery', name: 'Gallery', slug: 'gallery', order: 1 },
    { id: 'rsvp', name: 'RSVP', slug: 'rsvp', order: 2 },
    { id: 'registry', name: 'Registry', slug: 'registry', order: 3 }
  ]
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
      'rsvpButtonLink',
      'defaultPages'
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

    // Validate defaultPages
    if (!Array.isArray(newSettings.defaultPages)) {
      console.error('defaultPages is not an array:', newSettings.defaultPages);
      return json({ error: 'defaultPages must be an array' }, { status: 400 });
    }

    console.log('Validating pages:', JSON.stringify(newSettings.defaultPages, null, 2));

    // Validate each default page
    for (const page of newSettings.defaultPages) {
      console.log('Validating page:', JSON.stringify(page, null, 2));

      // Check if all required fields exist and are of correct type
      const missingFields = [];
      if (!page.id) missingFields.push('id');
      if (!page.name) missingFields.push('name');
      if (page.slug === undefined) missingFields.push('slug');
      if (typeof page.order !== 'number') missingFields.push('order');

      if (missingFields.length > 0) {
        console.error('Page validation failed:', {
          page,
          missingFields,
          orderType: typeof page.order
        });
        return json(
          {
            error: 'Invalid default page format',
            details: `Page ${page.id || 'unknown'} is missing or has invalid fields: ${missingFields.join(', ')}`
          },
          { status: 400 }
        );
      }
    }

    // If we get here, all pages are valid
    console.log('All pages validated successfully');

    // Reassign sequential order numbers to all pages
    const allPages = [
      ...newSettings.defaultPages,
      ...(newSettings.pages || []) // Include non-default pages if they exist
    ]
      .sort((a, b) => a.order - b.order) // Sort by current order
      .map((page, index) => ({
        ...page,
        order: index // Assign new sequential order numbers
      }));

    // Split back into default and non-default pages
    newSettings.defaultPages = allPages.filter((page) =>
      newSettings.defaultPages.some((defaultPage) => defaultPage.id === page.id)
    );
    if (newSettings.pages) {
      newSettings.pages = allPages.filter(
        (page) => !newSettings.defaultPages.some((defaultPage) => defaultPage.id === page.id)
      );
    }

    // Save to KV
    await platform.env.IMAGES_KV.put('wedding_settings', JSON.stringify(newSettings));

    return json({ settings: newSettings });
  } catch (err) {
    console.error('Error saving settings:', err);
    return json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
