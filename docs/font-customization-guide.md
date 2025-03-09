# Font Customization Guide

This guide explains how to customize fonts on your wedding website, including using Google Fonts and adding custom fonts.

## Table of Contents

1. [Using the Theme Manager](#using-the-theme-manager)
2. [Using Google Fonts](#using-google-fonts)
3. [Adding Your Own Fonts](#adding-your-own-fonts)
4. [Font Performance Tips](#font-performance-tips)

## Using the Theme Manager

The wedding website includes a built-in Theme Manager that makes it easy to customize fonts:

1. Navigate to the admin panel at `/admin`
2. Click on "Manage Theme"
3. Select the "Custom Theme" tab
4. Scroll down to the Typography section

You'll see options for both Heading Font and Body Font. These can be customized independently.

## Using Google Fonts

### Option 1: Select from Pre-configured Google Fonts

The easiest way to use Google Fonts is to select from our pre-configured options:

1. In the Theme Manager's Typography section, use the dropdown to browse fonts
2. Use the category buttons (Serif, Sans-Serif, Display/Script) to filter options
3. Select a font to see it previewed instantly
4. Click "Preview" to see it applied to the entire site
5. Click "Save Theme" when you're satisfied

### Option 2: Use Any Google Font via Copy & Paste

You can use any Google Font, even if it's not in our presets:

1. Visit [Google Fonts](https://fonts.google.com/)
2. Browse and find a font you like
3. Note the exact font name (e.g., "Abril Fatface")
4. In the Theme Manager, click "Use Custom Font" next to either Heading or Body Font
5. Paste the font name into the text field
6. Add a fallback font category after a comma (e.g., "Abril Fatface, serif")
7. Click "Apply" to preview the font
8. Click "Preview" to see it applied to the entire site
9. Click "Save Theme" when you're satisfied

Example custom font inputs:

- `Pacifico, cursive`
- `Merriweather, serif`
- `Oswald, sans-serif`
- `Fira Code, monospace`

## Adding Your Own Fonts

If you want to use custom fonts that aren't available on Google Fonts (such as purchased fonts or fonts from your print materials):

1. **Prepare your font files:**

   - Convert your fonts to web formats (WOFF2 and WOFF)
   - You can use services like [Font Squirrel Generator](https://www.fontsquirrel.com/tools/webfont-generator) or [Transfonter](https://transfonter.org/)

2. **Add the font files to your project:**

   ```
   mkdir -p static/fonts
   ```

   Then add your converted font files to this directory.

3. **Create or update the custom font CSS:**
   In `src/lib/styles/custom-fonts.css`, add your font definitions:

   ```css
   @font-face {
     font-family: 'YourCustomFont';
     src:
       url('/fonts/YourCustomFont.woff2') format('woff2'),
       url('/fonts/YourCustomFont.woff') format('woff');
     font-weight: normal;
     font-style: normal;
     font-display: swap;
   }
   ```

4. **Use your custom font in the Theme Manager:**
   - Click "Use Custom Font"
   - Enter your font name with fallbacks: `YourCustomFont, sans-serif`
   - Click "Apply" and save your theme

## Font Performance Tips

To ensure your wedding website loads quickly:

1. **Limit font variations:**

   - Only include the weights and styles you need (regular, bold, etc.)
   - Each additional font weight increases page load time

2. **Add fallbacks:**

   - Always include fallback fonts after your custom font
   - This ensures text is visible while custom fonts load

3. **Use font-display: swap:**

   - This is already configured in our system
   - Shows a fallback font immediately while custom fonts load

4. **Subset your fonts:**

   - If using font conversion tools, consider subsetting to only include characters you need
   - For English text, you can often reduce file size by 80%

5. **Test performance:**
   - Use Chrome DevTools Network tab to see how font loading affects page speed
   - Consider using system fonts for better performance on less important pages
