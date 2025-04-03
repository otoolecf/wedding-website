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

## Testing Locally

Testing locally is kind of hard when using the cloud stuff! Honestly, I prefer having a dev branch deploying in cloud infrastructure, so that it is behaving the same as it will on Prod. The biggest downside is that cloud deploys can take a bit longer than an `npm run dev` command.

To test locally, you will need 2 terminal windows, one for frontend and one for backend.

### Frontend

To get the frontend built, run:

`npm run dev`

You can now access the site at `http://localhost:5173/` ; changes are tracked so every time you save code changes the site will be reloaded.

### Backend

For a local test backend, run:

`wrangler dev`

This will build a local version of the cloudflare Workers backend and any of the resources you have defined in your `wrangler.toml` file.

If you want to point to the actual cloud resources (e.g., R2 objects, KV storage, etc.) while testing locally, you can run with the remote flag:
`wrangler dev --remote`

You can run `d` in the terminal window once built to open devtools.

## Why Cloudflare?

Cloudflare has a very generous free tier for backend serverless workers, no object storage egress fees (R2, the S3 equivalent), and domains are also much cheaper to purchase directly through cloudflare vs domain registry companies like GoDaddy.

## Why Svelte?

Svelte is very simple and straightforward to get a lightweight site up and running!
