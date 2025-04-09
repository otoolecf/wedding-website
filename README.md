# Wedding Website

This is a custom wedding website using SvelteKit and Cloudflare. It is intended to be an alternative to standard wedding websites like The Knot, and for most use cases is completely free. It can easily be used with a custom domain; You will still have to pay for the domain, but going through a provider like Cloudflare is usually significantly cheaper than buying the domain throguh a wedding site service, and still cheaper than something like GoDaddy. It is also a great way to really personalize the experience! The site provides a complete solution for managing wedding information, RSVPs, and photos, with a focus on ease of customization and maintenance.

Key benefits:

- Full visual customization through an admin interface
- Secure and reliable hosting
- Cost-effective infrastructure
- Simple guest experience
- No coding required for content updates

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

## Documentation

- [Font Customization Guide](docs/font-customization-guide.md) - How to use Google Fonts and custom fonts
- [Theme System Guide](docs/theme-system-guide.md) - How to customize colors and apply theme presets
- [Content Setup Guide](docs/content-setup-guide.md) - How to set up and adjust site content
- [Gallery Guide](docs/gallery-guide.md) - How to use and manage the image gallery system
- [RSVP and Guest List Admin Guide](docs/rsvp-admin-guide.md) - Comprehensive guide to managing RSVPs and guest information
- [Admin Settings Guide](docs/admin-settings-guide.md) - Complete guide to configuring and managing all site settings

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

## Behind the Scenes

This section is very personal to me and my opinions on this project as a whole. It has some details on my motivations for the project, my notes on what I used for this project, what I liked, what I didn't like, and general thoughts on the process and usability of it all.

### Background and Motivation

I am a software engineer by trade, so I have some experience with web and cloud development! I had about a year and a half between the engagement and the wedding, so I felt safe committing to building the wedding website myself, knowing I could always fall back to one of the more popular & free online site builders. I had some accountability for once on a personal project, but plenty of time and pretty low stakes (max 150 users maybe), so it was motivating but not overwhelming to get this done. I don't have much experience standing up a website truly from scratch, so I wanted to take the chance to put a personal touch on an exciting event, show off a bit to my friends and family, and try out some new technologies I have been interested in. The result is arguably a less-featured (read: shitty) version of The Knot, but it is a true "soup to nuts" custom build with what I think are some unique and cool customizations around configurability, and sets you up with a pretty solid starting-point custom wedding website. Plus, it should be completely free to host, assuming you don't have tens of thousands of friends/family/guests (I sure don't)! Cost-effectiveness and generous free tiers was a very strong factor in selecting these services/technologies.

### Tech Stack & Services

I usually use AWS for cloud / hosting services and javascript / node.js language, and Vue for web framework at work. I wanted to shake things up and try out SvelteKit web framework and Cloudflare for cloud service, which have both been on my list to try out. I have also been wanting to try out some AI helper coding tools to see how fast and to what level I could get a "polished" project completed.

Here are my opinions on the components of the tech stack; I want to make a disclaimer that I am by no means an expert, pro, or purist with front end development. For me, front end is largely a means to an end and I view it almost as a "necessary evil". Part of this is probably because I am a self-taught programmer so I didn't start off my programming career with the strongest grasp of UI development patterns, HTML, etc.; Part of it is because I am a bit of a perfectionist and often finding myself spending an hour adjusting the width and postioning of a textbox or something similar. If you are a UI dev you may have some very strong opinions on my blasphemous statements on web framework; feel free to let me know (nicely), I am always interested to learn more.

#### Why SvelteKit?

I use angularJS (the old one) at work daily and it is a bit complicated. I understand why they made new ones, but it is pretty easy to add on to things and get some cool SPAs going once you get the hang of it. I have a problem where I end up with huge scope / controller files to get things done efficiently, and directives are really awkward and weird to create for something that is supposed to be reusable.

I also use Vue 3 at work daily and like it a lot (especially in comparison to angularJS). It is simple to read and I really like the logical compartmentalization the single file component offers, and it makes jumping in a lot easier because all your context is present in the same file. I like that it mostly still reads like HTML. It is so easy to make reusable UI components. The options API is a little weird though, and the Composition API is also a little weird in a differnt way, and some of the prop inheritance is a little weird. Most of it makes sense, but there are some clunky parts, probably because they serve some really powerful use case for scale or crazy apps, but for most of my use cases the benefits of these clunky parts are overkill for my use case and I try to work around them. Setting up routing can be weird, and backend logic & APIs have to be a separate setup / deploy project, so it can take some organization and discipline to keep things consistent and keep a holistic picture of the app when working with Vue.

I have recently gotten some experience with React and Next.js as well, and really like the simplicity of the file-based routing! It is great to have front end live right next to the backend in the code, and the file-based routing makes it really easy to chase down bugs. That being said, I am really just not a fan of React, a lot of it is not intuitive to me and feels awkward. I also am not a fan of the clunkiness / overhead of Next.js, it also feels very overkill for a lot of my use cases.

I did some research and Svelte/SvelteKit looked like a nice combo of the 2 that is super lightweight and gaining some traction recently, so would probably be a good framework to get some experience with. Plus, it has some direct integrations with Cloudflare that would make my life a bit easier deploying changes.

SvelteKit is awesome. I think it is the best of both worlds honestly, it reads SFC-style and HTML-like in the svelte files, but also has the benefits of the file-based routing. It is super lightweight and very quick to get going, but has enough functionality that every time I thought I was going to get blocked I found out a new feature to solve my problem. My only real complaint is it is kind of hard to flip back and forth between files in VSCode because all of the files have the same end path, but overall I am a fan and will definitely use again. I really liked that it worked pretty much out of box with cloudflare with very minimal configuration, and I would expect it to behave similarly for AWS / Azure / GCP as well.

### Why Cloudflare?

Cloudflare is traditionally more focused on web hosting, DNS, and CDN services. Recently, they have been heavily expanding their cloud offerings (especially in AI and cybersecurity). They also have probably the best free tier of any provider, and I wanted to get some experience with something other than AWS. I knew I could easily stay within free tier without much issue, and no egress fees for their S3 equivalent was pretty attractive for a wedding webiste, which usually has a lot of images.

I think Cloudflare is great! Their free tier alone makes it worth using, but they do have a pretty easy development experience on top of it. Despite no experience with Cloudflare or Sveltekit, I was able to get something I could get to in a browser in about an hour and a half, which is pretty impressive. The github integration is very nice, all I have to do is push to prod and it will automatically deploy. It was super easy to buy and set up a domain for the site.

That being said, I do think it has some limitations, and I don't think I would count it as a full "cloud provider" in the same breath as AWS, Azure, and GCP. In my opinion it would be pretty difficult to do a full SaaS, or even a web app with heavy business logic. They only have serverless functions for a backend offering, and only in javascript (not full Node.JS), and it looks like it is fairly coupled to their HTML / static hosting. Their extra services are fine and good! They offer a Workers KV, which is just a key-value store and does the job. It did take some getting used to since it is eventually consistent, so one has to be very careful around read-after-writes. I would prefer to use AWS DynamoDB. D1 is just SQLite, which is easy, simple, and fast, but huge volumes of data might start to cause issues. R2 is just S3, infinitely useful infinite storage which is even more dirt cheap on Cloudflare. I didn't use their queues service.

Cloudflare is really great for websites and most standard web apps though, wedding websites included, and I would definitely use again!

### Why Brevo?

I really wanted emails to send people a copy of their RSVP response! I have used Sendgrid in the past, but Sendgrid costs money. Brevo had the best free tier of API email services, it lets me send 300 emails per day without even needing a credit card. It was fast to set up and easy to verify my domain, it let me log into Cloudflare directly through their portal to apply the DNS records. It sends the email when I call the API, no complaints!

### Why Tailwind CSS?

Tailwind is super popular and I really only have a little experience with it. I am honestly lukewarm on it. It is easy for quick prototyping, but I have had trouble in the past with the inline CSS adjustments on large projects, it is very easy for things to become a beast of their own. I perfer regular CSS classes to keep things simple and uniform styling, it ends up being less typing and is easier to make a site "cohesive" in my opinion. I am still not great at either Tailwind or regular CSS.

### Claude, Cursor, and Other AI Help

I used AI help for this, including some code generation. It is somewhat controversial right now (at least at the time of this writing in April 2025), but it does speed me up a lot!

I used Claude's github integration in the regular chat web interface for the first half, and it is great. I also find that Claude is a good "sentient rubber duck" to bounce ideas off with (somewhat) collaboratively and to get a basic idea of what is "typical" best practice for architecture decisions. I use ChatGPT for quick hits and other day-to-day or one-offs, but really like Claude Projects.

I used Cursor for the first time for the second half of this project and really love it. I am a VSCode fan and feel in my element inside cursor, and love the direct apply to the file with the diff view. If you have not tried it and are a programmer, I recommend giving it a whirl, it feels very natural and easy to use.

I think this would have taken me at least 2 more months without AI help. I still had to design the features and functionality. I still wrote my own code. I still read the generated code, understand the generated code, and where it fits in the larger project. I often had to fix bugs in a lot of the generated code. But, honestly, it is pretty fun to code with AI. For me, where AI really shines is on UI, which is my least favorite, as I often have the vision in my head but takes ages to implement (Without AI). I am a builder at heart, and really enjoy seeing some concrete results, and AI is excellent at speeding up the 0 to 1 step and getting some visual outcomes for me before I lose interest or motivation. I have a lot to say on this and am happy to expand if you are interested or have differing opinions.

## Final Thoughts and Planned Improvements

I learned a lot from this project, got some experience with some new technologies, and found a lot of keepers for future projects. I also hope that maybe someone else can use this and get joy from this. You can use it for your own wedding to save some money and add a personal touch, use it as a starting point for your own personal project, or whatever else you want!

I plan to add screenshots of the interface and documentation to make it easier to understand the system. If you're interested in contributing or have specific features you'd like to see, feel free to open an issue!
