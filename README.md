# Wedding Website

A custom wedding website using SvelteKit and Cloudflare - a free alternative to standard wedding websites like The Knot. It's easily used with a custom domain (you'll still pay for the domain, but it's usually cheaper through Cloudflare than through a wedding site service or GoDaddy). The site provides a complete solution for managing wedding information, RSVPs, and photos, with a focus on ease of customization and maintenance.

> If you are more curious about my personal motivations and opinions rather than implementing the site yourself, I wrote about my experience building this thing in [JOURNEY.md](JOURNEY.md) - it's got all my opinions on the tech I used, what worked, what didn't, and the whole process.

**Key benefits:**

- Full visual customization through an admin interface
- Secure and reliable hosting
- Cost-effective infrastructure
- Simple guest experience
- No coding required for content updates

![Website Preview - Coming Soon](path/to/screenshot.png)

## Table of Contents

- [Features](#features)
- [Project Status & Requirements](#project-status--requirements)
- [Admin Interface](#admin-interface)
- [How It All Works](#how-it-all-works)
- [Setup Instructions](#setup-instructions)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Project Background](#project-background)

## Features

- **Visual Customization**

  - Customize colors, fonts, and styles
  - Rearrange pages and sections
  - Add or remove content blocks
  - Preview changes before publishing

- **Content Management**

  - Edit text, images, and links
  - Organize photos into galleries
  - Create custom pages
  - Update wedding details

- **Essential Pages**

  - Home page with key information
  - Photo gallery with lightbox
  - RSVP form with email confirmations
  - Registry page
  - Custom pages

- **Guest Features**
  - Mobile-responsive design
  - Simple RSVP process
  - Photo galleries
  - Clear information display

## Project Status & Requirements

### Current Status

This project is being actively used for my own wedding website, and theoretically can be adapted out-of-box to your own! If you try to use it for your own needs and run into trouble, open an issue and I will try to accommodate. Feel free to contact me directly if you want help setting this up. My main goal (apart from learning) was to have it designed so I could hand over content duties to my non-programmer partner, much like The Knot or other popular wedding site builder services.

### Prerequisites

To use this project, you do have to be somewhat technical. You should have:

- Basic understanding of web hosting and domain management
- A Cloudflare account (free tier is sufficient)
- A domain name (can be purchased through Cloudflare)
- Basic understanding of environment variables and configuration
- Familiarity with command line tools (for setup and deployment)

If you want to use it but are having trouble with some of the technical parts, contact me! I am happy to help.

### Technical Requirements

- Node.js 18+ and npm
- Cloudflare account with access to:
  - Pages
  - Workers
  - D1 Database
  - KV Storage
  - R2 Storage
  - Zero Trust (for admin protection)
- Brevo account (for email notifications)

## Admin Interface

The admin dashboard provides access to all website configuration options. It's accessed at `/admin` and protected by Cloudflare Zero Trust.

The admin interface allows complete customization without requiring code changes:

### Site Settings

Configure basic wedding information including names, date, location, and other details that appear throughout the site.

### Theme Editor

Adjust colors and fonts for the entire website. Options include:

- Color selection for all site elements
- Font choices for headings and body text
- Pre-made theme presets
- Custom theme creation

### Gallery Manager

Central image management system:

- Upload and organize images
- Create albums for better organization
- Add captions and metadata
- Images uploaded here can be used throughout the site

### Page Builder

Interface for creating and modifying pages:

- Drag and drop sections to create layouts
- Add various content blocks (text, images, maps, timelines)
- Reorder sections as needed
- Configure section-specific settings
- Add hyperlinks to other pages or external sites

### RSVP Dashboard

Guest response management:

- View all submitted RSVPs
- Export guest data for planning
- Manage guest list
- Send reminder emails to pending guests

### Registry Links

Add and manage registry information with custom images and descriptions.

### Preview Mode

All changes stay in preview mode until you're ready to publish, so you can experiment without breaking your live site.

### Staging to Production

When you're happy with how everything looks on your staging site, there's a handy feature to copy everything over to production in one go. No more copying and pasting between environments! When everything looks perfect, just hit publish!

## How It All Works

The admin interface components work together as an integrated system:

### Image Management

The Gallery Manager is the central repository for all images:

1. All images must be uploaded to the gallery first
2. Images are automatically optimized and resized
3. Once in the gallery, images can be used anywhere on the site
4. To add a new image to any page, it must first exist in the gallery

### Site Building Process

1. **Site Settings**
   Set basic information like names, wedding date, and location. These details appear throughout the site and in default templates.

2. **Theme Settings**
   Set colors and fonts for the entire site. Changes apply globally to maintain consistent styling.

3. **Default Pages**
   The site includes pre-built pages (Home, Gallery, RSVP, Registry) that you can customize.

4. **Custom Pages**
   Use the Page Builder to:
   - Create new pages
   - Add content sections (text, images, maps, etc.)
   - Arrange sections in your preferred order
   - Link to other pages or external sites

### RSVP System

1. **Guest List Management**

   - Add guests individually or upload in bulk from a spreadsheet
   - Include guest details like email and meal preferences
   - Organize guests by household

2. **RSVP Form Settings**

   - Configure what information to collect
   - Set deadlines
   - Customize messages

3. **Response Management**
   - Track responses
   - Send reminders
   - Export guest data
   - Edit email templates for confirmation messages

### Preview and Publishing

The site uses a staging-to-production workflow:

1. Changes made in the admin are saved to preview mode
2. Preview the site to check changes before publishing
3. Publish changes when ready
4. Use the staging-to-production sync for moving multiple changes at once

This approach lets you make and test changes without affecting the live site.

## Setup Instructions

### Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy and configure `wrangler.toml`
4. Create Cloudflare resources (D1, KV, R2)
5. Set up environment variables
6. Deploy to Cloudflare Pages

### Detailed Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `wrangler.toml` to `wrangler.toml.example` and update it with your Cloudflare configuration:
   - Replace all `REPLACE_WITH_YOUR_*` placeholders with your actual Cloudflare resource IDs
   - Update domain names and URLs to match your setup
4. Create necessary Cloudflare resources:
   - D1 Database for RSVPs
   - KV Namespace for image metadata
   - R2 Bucket for image storage
     - Configure the R2 bucket with a custom domain
     - Ensure the bucket is set to be publicly accessible for image serving
     - Set CORS policy to only allow GET and HEAD requests from your website domains
5. Set up your environment variables:
   - For local development: Create a `.dev.vars` file (never commit this!)
   - For production: Set them up in the Cloudflare Pages settings under the GitHub integration
   - For preview: You can set them up in the Cloudflare Pages settings too, or they'll inherit from production

The main environment variables you'll need are:

- `ENVIRONMENT` (development/preview/production)
- `SITE_URL` (your site's URL)
- `IMAGES_BUCKET_SITE_URL` (where your images are hosted)
- `IMAGES_BUCKET_NAME` (your R2 bucket name)
- `IMAGES_KV` (your KV namespace ID for image metadata)
- `PROD_IMAGES_KV` (your production KV namespace ID)
- `PROD_IMAGES_BUCKET` (your production R2 bucket name)
- `RSVPS` (your D1 database ID)
- `BREVO_API_KEY` (your Brevo/Sendinblue API key for email notifications)
- `EMAIL_SENDER_NAME` (the name that will appear in the "From" field of emails)
- `EMAIL_SENDER_ADDRESS` (the email address that will be used to send notifications)

You can find these IDs in your Cloudflare dashboard under:

- Workers & Pages > D1 > Your Database
- Workers & Pages > KV > Your Namespace
- R2 > Your Bucket

For the Brevo API key, you'll need to:

1. Sign up for a Brevo account
2. Go to SMTP & API > API Keys
3. Create a new API key with appropriate permissions

### Environment Setup Tips

1. **Staging vs Production**:

   - It's best to set up two separate Cloudflare Pages projects: one for staging and one for production
   - This allows you to make changes (and mistakes) in the privacy of Cloudflare zero trust on staging
   - Once changes are tested and ready, you can deploy to production
   - Use different domains for each (e.g., `staging.yourdomain.com` and `yourdomain.com`)

2. **KV Namespaces**:

   - For production, `IMAGES_KV` and `PROD_IMAGES_KV` should point to the same namespace
   - For staging/preview, they should be separate to avoid affecting production data
   - This separation allows you to test image uploads and management without risking production data
   - When you are happy with the staging images, there is functionality to copy them over all at once to production!

3. **Database Setup**:

   - Similar to KV, keep staging and production databases separate
   - Use the preview database for testing RSVP functionality
   - Only use the production database when you're ready to go live
   - Note: RSVPs and guest lists are stored in the database and are unaffected by deployments
   - This means you can safely deploy changes to the site without affecting any submitted RSVPs or guest data

4. **Zero Trust Access**:

   - For preview/staging environment:
     - Set up Zero Trust access for the entire site
     - This ensures only authorized users can access the preview site
     - Configure access policies to match your needs
   - For production environment:
     - Only apply Zero Trust access to the admin paths (e.g., `/admin`)
     - Keep the main site publicly accessible
     - This allows guests to access the site while protecting admin functionality
   - Access policies can be configured in Cloudflare Zero Trust > Access > Applications

## Development

### Local Development

Testing locally is kind of hard when using the cloud stuff! Honestly, I prefer having a dev branch deploying in cloud infrastructure, so that it is behaving the same as it will on Prod. The biggest downside is that cloud deploys can take a bit longer than an `npm run dev` command.

If you still want to test locally (at your own risk), you will need 2 terminal windows, one for frontend and one for backend.

#### Frontend

To get the frontend built, run:

```bash
npm run dev
```

You can now access the site at `http://localhost:5173/` ; changes are tracked so every time you save code changes the site will be reloaded.

#### Backend

For a local test backend, run:

```bash
wrangler dev
```

This will build a local version of the cloudflare Workers backend and any of the resources you have defined in your `wrangler.toml` file.

If you want to point to the actual cloud resources (e.g., R2 objects, KV storage, etc.) while testing locally, you can run with the remote flag:

```bash
wrangler dev --remote
```

You can run `d` in the terminal window once built to open devtools.

##### Local Development Tips

- Use `wrangler dev --local` for local persistence (useful for testing D1 database)
- Use `wrangler d1 execute wedding-rsvps-preview --local --file=./schema.sql` to set up your local database
- Press `d` in the wrangler terminal to open devtools for debugging
- Both frontend and backend support hot reloading

## Deployment

The project is configured to deploy to Cloudflare Pages & Workers. Pushes to dev, staging, or prod branches will automatically trigger a deployment.

## Documentation

- [Font Customization Guide](docs/font-customization-guide.md) - How to use Google Fonts and custom fonts
- [Theme System Guide](docs/theme-system-guide.md) - How to customize colors and apply theme presets
- [Content Setup Guide](docs/content-setup-guide.md) - How to set up and adjust site content
- [Gallery Guide](docs/gallery-guide.md) - How to use and manage the image gallery system
- [RSVP and Guest List Admin Guide](docs/rsvp-admin-guide.md) - Comprehensive guide to managing RSVPs and guest information
- [Admin Settings Guide](docs/admin-settings-guide.md) - Complete guide to configuring and managing all site settings
- [Project Journey](JOURNEY.md) - My personal experience building this project, tech choices, and opinions

## Project Background

I built this as an alternative to paid wedding websites, with the dual purpose of learning new technologies and creating something truly customizable for my own wedding.

I wanted to create something that would:

1. Be completely free to host (or very close to it)
2. Allow full customization of the look and feel
3. Let my non-technical partner manage content easily
4. Provide a simple RSVP system with email confirmations

For my complete journey including detailed thoughts on the tech stack choices, challenges, and what I learned, check out the [Project Journey](JOURNEY.md) document.

## Contributing

Contributions are welcome! If you're interested in improving this project, please feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

Areas where help would be especially appreciated:

- Improved mobile responsiveness
- Additional theme presets
- Documentation improvements
- Accessibility enhancements

## License

[MIT License](LICENSE)

---

_Built with ❤️ for my own wedding. I hope it helps with yours too!_
