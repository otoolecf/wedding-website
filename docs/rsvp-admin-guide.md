# RSVP and Guest List Admin Guide

This guide provides detailed information about all features available in the RSVP admin section of the wedding website.

## Accessing the RSVP Admin

The RSVP admin section is accessible through the main admin dashboard at `/admin`. It's protected by Cloudflare Zero Trust authentication to ensure only authorized users can access guest information.

## Guest List Management

### Adding Guests

1. **Individual Guest Entry**

   - Click "Add Guest" to create a new guest entry
   - Required fields:
     - Name
   - Optional fields:
     - Partner Name
     - Plus One Allowed (boolean)

2. **Bulk Import**
   - Upload a CSV file with guest information
   - Required columns:
     - name
   - Optional columns:
     - partner_name

### Organizing Guests

- View guest list in alphabetical order
- Delete individual guests (which also deletes associated RSVPs)
- Search by name

## RSVP Form Configuration

### Form Settings

Configure labels for the following form fields:

- Name Field
- Email Field
- Attendance Question
- Additional Guests Label
- Vegetarian Question
- Food Allergies Label
- Lodging Question
- Transport Question
- Song Request Label
- Special Notes Label

## Response Management

### Viewing Responses

- View all responses in a table format
- See response statistics:
  - Total responses
  - Total attending
  - Total not attending
  - Total guests
  - Pending responses
- Export responses to CSV with the following fields:
  - Name
  - Partner Name
  - Email
  - Attendance Status
  - Vegetarian Status
  - Food Allergies
  - Lodging Plans
  - Transport Plans
  - Song Request
  - Special Notes
  - Submission Date

### Response Actions

1. **Manual Updates**

   - Edit guest information
   - Update response status
   - Modify meal preferences
   - Add notes/comments

2. **Delete Responses**
   - Remove individual RSVPs
   - Confirmation required before deletion

### Email Management

1. **Confirmation Emails**
   - Customize email template
   - Preview email content
   - Test email delivery
   - Send email blast to all RSVPs
   - Automatic sending on RSVP submission

## Data Export

### Export Options

1. **RSVP Export**
   - Export all RSVPs to CSV
   - Includes all form fields
   - Formatted for easy import into spreadsheet software

## Security & Privacy

- All guest data is stored in Cloudflare D1 database
- Access is restricted to authorized users via Cloudflare Zero Trust
- Automatic data backup through Cloudflare infrastructure

## Best Practices

1. **Guest List Management**

   - Add guests before they RSVP
   - Include partner names when applicable
   - Keep guest list up to date

2. **Communication**

   - Ensure email template is properly formatted
   - Test email delivery before going live
   - Keep confirmation emails professional

3. **Data Management**
   - Export data regularly for backup
   - Review responses for accuracy
   - Update statuses promptly

## Troubleshooting

### Common Issues

1. **Email Delivery**

   - Check spam folder
   - Verify email templates
   - Confirm SMTP settings

2. **Form Issues**

   - Clear browser cache
   - Check form validation rules
   - Verify required fields

3. **Data Management**
   - Check database connection
   - Verify export permissions
   - Confirm file format compatibility

### Support

For technical issues:

- Check the Cloudflare dashboard for service status
- Review error logs in the admin interface
- Contact technical support if needed
