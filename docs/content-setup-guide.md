## Wedding Website Content Management System

### Introduction

The content management system allows you to easily edit any text content on your wedding website without needing to modify code. This guide will help you set up and use the system effectively.

### How It Works

The system uses Cloudflare KV storage to save your content and provides a rich text editor interface in the admin panel. Content is organized into named "sections" that can be placed throughout your website.

### Initial Setup

Follow these steps to set up your initial content:

1. Navigate to the Admin Dashboard at `/admin`
2. Click on "Manage Content"
3. Add these recommended content sections:

| Section Title             | Section Key               | Description                          |
| ------------------------- | ------------------------- | ------------------------------------ |
| Home Heading              | home_heading              | Main heading on home page            |
| Home Description          | home_description          | Main description text on home page   |
| Coming Soon Message       | coming_soon_message       | Text shown on coming soon page       |
| Story Introduction        | story_intro               | Introduction text for Our Story page |
| Details Introduction      | details_intro             | Introduction for Details page        |
| FAQ Introduction          | faq_intro                 | Introduction for FAQ page            |
| RSVP Introduction         | rsvp_intro                | Text at top of RSVP page             |
| Registry Introduction     | registry_intro            | Introduction for Registry page       |
| Wedding Venue Description | venue_description         | Wedding venue details                |
| Accommodation Description | accommodation_description | Accommodation information            |

### Adding a New Content Section

1. Click the "Add New Section" button
2. Enter a human-readable section title (e.g., "Homepage Welcome")
3. The section key will be auto-generated (e.g., "homepage_welcome")
4. Click "Add Section" and you'll be taken to the editor
5. Add your content using the rich text editor
6. Click "Save Changes"

### Using Content in Templates

To display content in your website, a developer would add the `ContentBlock` component to the appropriate page template:

```svelte
<ContentBlock
  contentKey="homepage_welcome"
  fallback="<p>Default text if content is not found</p>"
  className="additional-css-classes"
/>
```

The `fallback` parameter provides default text that will be displayed if the content section does not exist or fails to load.

### Rich Text Editor Features

The editor toolbar provides these formatting options:

- **Basic formatting**: Bold, italic, underline
- **Alignment**: Left, center, right
- **Lists**: Bulleted and numbered lists
- **Links**: Insert hyperlinks to other pages
- **Code**: View HTML source code if needed

### Best Practices

1. **Use descriptive keys**: Make section keys descriptive of the content
2. **Keep content modular**: Create separate sections for distinct parts of pages
3. **Use previews**: After updating content, view your site to confirm changes
4. **Include fallbacks**: Always specify fallback content for graceful degradation
5. **Consider page layout**: Keep in mind how content will flow in the page layout

### Troubleshooting

- If content doesn't appear, check the section key for typos
- If formatting looks wrong, try viewing the HTML in the editor and fix any broken tags
- If the editor is not working, try refreshing the page

### Need Help?

If you encounter any issues with the content management system, please reach out to your developer for assistance.
