## Wedding Website Content Management System

### Introduction

The content management system allows you to edit text content on your wedding website without needing to modify code. This guide will help you set up and use the system effectively.

### How It Works

The system uses Cloudflare KV storage to save your content and provides a rich text editor interface in the admin panel. Content is organized into named "sections" that can be placed throughout your website.

### Page Builder Overview

The page builder allows you to create and customize pages using pre-built sections and templates. Here's how it works:

1. **Sections**: The building blocks of your pages
2. **Templates**: Pre-designed page layouts
3. **Page Management**: Create, edit, and organize your pages

### Default Pages and Sections

The website comes with several default pages that are essential for a wedding website:

1. **Home Page**

   - Default sections: Hero, Text, Image Gallery
   - Key content sections: `home_heading`, `home_description`
   - Purpose: Welcome visitors and provide key information

2. **Gallery Page**

   - Default sections: Hero, Image Gallery
   - Purpose: Showcase wedding photos and memories

3. **RSVP Page**

   - Default sections: Hero, Form
   - Key content sections: `rsvp_intro`
   - Purpose: Collect guest responses

4. **Registry Page**
   - Default sections: Hero, Text, Buttons
   - Key content sections: `registry_intro`
   - Purpose: Share gift registry information

### Available Section Types

The page builder includes these section types:

1. **Text Section**

   - Simple text with rich formatting
   - Perfect for paragraphs and general content

2. **Image Section**

   - Single image with caption
   - Customizable alignment and width
   - Options: left, center, right alignment
   - Width options: small, medium, large, full

3. **Text with Image (Left/Right)**

   - Text content with an image on either side
   - Customizable image width (1/4, 1/3, 1/2, 2/3)
   - Vertical alignment options (top, center, bottom)

4. **Hero Section**

   - Full-width banner with text overlay
   - Customizable heading and subheading
   - Text color options (light/dark)
   - Height options (small, medium, large, full)
   - Optional call-to-action button

5. **Image Gallery**

   - Grid of images
   - Column options (2, 3, 4)
   - Spacing options (small, medium, large)

6. **Text Columns**

   - Multiple columns of text
   - Column count options (2, 3, 4)
   - Customizable spacing

7. **Spacer**

   - Add vertical space between sections
   - Height options (small, medium, large, extra-large)

8. **Divider**

   - Horizontal line divider
   - Style options (solid, dashed, dotted)
   - Width options (narrow, medium, wide, full)
   - Color options (light, medium, dark, accent, primary)

9. **Button**
   - Call-to-action button
   - Alignment options (left, center, right)
   - Style options (primary, secondary, outline)
   - Size options (small, medium, large)

### Available Templates

The system includes these pre-designed templates:

1. **Our Story**

   - Hero section with title
   - Text and image sections for your story
   - Spacers for visual separation

2. **Wedding Details**

   - Hero section
   - Information sections
   - Customizable layout

3. **Accommodations**

   - Hero section
   - Hotel information
   - Booking details

4. **FAQ**

   - Hero section
   - Question and answer format
   - Customizable content

5. **Registry**
   - Hero section
   - Gift information
   - Links to registries

### Using the Page Builder

1. **Creating a New Page**

   - Navigate to the Admin Dashboard at `/admin`
   - Click on "Manage Pages"
   - Click "Add New Page"
   - Enter page name and URL slug
   - Choose to start with a template or blank page

2. **Adding Sections**

   - Click "Add Section" in the page editor
   - Choose a section type from the menu
   - Configure the section's properties
   - Use up/down arrows to reorder sections

3. **Editing Sections**

   - Click on any section to edit
   - Use the rich text editor for text content
   - Upload and select images
   - Adjust layout and styling options

4. **Using Templates**

   - Click "Apply Template" in the page editor
   - Choose from available templates
   - Select to replace existing content or add to it
   - Customize the template content

5. **Previewing and Saving**
   - Use the preview mode to see changes
   - Click "Save Page" to publish changes
   - Changes are live immediately

### Managing Page Order

1. **Reordering Pages**

   - Access page order management in the admin dashboard
   - Use up/down arrows to adjust page order
   - Changes affect site navigation immediately
   - Default pages are marked with a "Default" badge

2. **Reordering Sections**
   - Use the up/down arrows next to each section
   - Changes are saved automatically
   - Preview changes in real-time
   - Sections maintain their content and properties when reordered

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

### Best Practices

1. **Use descriptive keys**: Make section keys descriptive of the content
2. **Keep content modular**: Create separate sections for distinct parts of pages
3. **Use previews**: After updating content, view your site to confirm changes
4. **Include fallbacks**: Always specify fallback content for graceful degradation
5. **Consider page layout**: Keep in mind how content will flow in the page layout
6. **Use templates**: Start with templates for common page types
7. **Maintain consistency**: Use similar section types for similar content
8. **Optimize images**: Compress images before uploading
9. **Test responsiveness**: Check how pages look on different devices

### Troubleshooting

- If content doesn't appear, check the section key for typos
- If formatting looks wrong, try viewing the HTML in the editor and fix any broken tags
- If the editor is not working, try refreshing the page
- If a page isn't saving, check your internet connection
- If images aren't loading, verify they were uploaded successfully

### Need Help?

If you encounter any issues with the content management system, please reach out to your developer for assistance.
