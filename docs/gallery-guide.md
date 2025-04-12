# Image Gallery Guide

The wedding website includes an image gallery system that serves as the central repository for all images used throughout the site. This guide will help you understand how to use and manage the gallery effectively.

## Overview

The gallery system is designed to:

- Serve as a central repository for all images
- Automatically optimize and store images in Cloudflare R2
- Provide a user-friendly interface for managing images
- Enable image reuse across the site
- Support image metadata (captions and alt text)

## Accessing the Gallery

1. Navigate to the admin dashboard at `/admin`
2. Click on "Gallery Manager" in the navigation menu
3. You'll see all your uploaded images organized in a grid view

## Managing Images

### Uploading Images

1. Click the "Upload Images" button in the gallery manager
2. Select an image from your computer
3. Optionally add a caption and alt text
4. Click "Upload Image"
5. Images will automatically be:
   - Stored in your Cloudflare R2 bucket
   - Added to the gallery with metadata
   - Made available for use throughout the site

### Image Details

Each image in the gallery has associated metadata:

- Caption (optional)
- Alt text (for accessibility)
- Image ID
- Usage locations (where the image is used on the site)

### Using Images

Once uploaded to the gallery, images can be used throughout the site:

1. In the gallery page itself
2. In custom content sections
3. In the hero section of any page

## Best Practices

1. **Image Preparation**

   - Use high-quality images
   - Save images in JPG or PNG format
   - Keep file sizes reasonable

2. **Organization**

   - Use descriptive captions
   - Add alt text for accessibility
   - Keep track of where images are used

3. **Performance**
   - The system automatically optimizes images
   - Don't upload the same image multiple times
   - Use the gallery's built-in image selection

## Troubleshooting

### Common Issues

1. **Upload Fails**

   - Check file size
   - Verify file format (JPG or PNG)
   - Ensure you have sufficient storage space

2. **Image Not Appearing**

   - Verify the image was successfully uploaded
   - Clear your browser cache

3. **Slow Loading**
   - Images are automatically optimized
   - If issues persist, check your internet connection

## Technical Details

The gallery system uses:

- Cloudflare R2 for image storage
- Cloudflare KV for image metadata
- Automatic image optimization
- Responsive image delivery

All images are served through Cloudflare's global CDN for optimal performance worldwide.
