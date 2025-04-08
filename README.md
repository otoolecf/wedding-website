# Wedding Website

This is a custom wedding website using SvelteKit and Cloudflare.

## Features

- Responsive design for all devices
- RSVP form with database storage
- Photo gallery with admin management
- Theme customization system
- Custom font support
- Content editing

## Documentation

- [Font Customization Guide](docs/font-customization-guide.md) - How to use Google Fonts and custom fonts
- [Theme System Guide](docs/theme-system-guide.md) - How to customize colors and apply theme presets
- [Content Setup Guide](docs/content-setup-guide.md) - How to set up and adjust site content

## Setup Instructions

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
- `RSVPS_PROD` (your production D1 database ID)
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

##### Environment Setup Tips

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

## Why Cloudflare?

Cloudflare has a very generous free tier for backend serverless workers, no object storage egress fees (R2, the S3 equivalent), and domains are also much cheaper to purchase directly through cloudflare vs domain registry companies like GoDaddy. There are a lot of nice and helpful tools around domain management, email forwarding, github integrations, and security that make it a fairly quick and easy setup experience.

## Why Svelte?

Svelte is very simple and straightforward to get a lightweight site up and running!

## Why Brevo?

Emails are cool functionality to have and it is nice for guests to see what they just said and be able to save it for later. Brevo has a very generous free tier where you don't need a credit card and can get 300 emails / day.
