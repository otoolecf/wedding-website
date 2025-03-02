# Wedding Website

This is a custom wedidng website using SvelteKit and Cloudflare.

## Testing Locally

To test locally, you will need 2 terminal windows, one for frontend and one for backend.

### Frontend

To get the frontend built, run:

`npm run dev`

You can now access the site at `http://localhost:5173/` ; changes are tracked so every time you save code changes the site will be reloaded.

### Backend

For a local test backend, run:

`wrangler dev`

This will build a local version of the cloudflare Workers backend and any of the resources you have defined in your `wrangler.toml` file.

If you want to point to the actual cloud resources (e.g., R2 objects, KV storeag, etc.) while testing locally, you can run with the remote flag:
`wrangler dev --remote`

You can run `d` in the terminal window once built to open devtools.

## Why Cloudflare?

Cloudflare has a very generous free tier for backend serverless workers, no object storage egress fees (R2, the S3 equivalent), and domains are also much cheaper to purchase directly through cloudflare vs domain registry companies like GoDaddy.

## Why Svelte?

Svelte is very simple and straightforward to get a lightweight site up and running!
