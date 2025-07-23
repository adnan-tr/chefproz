# Client Requests Handling Guide

This guide provides step-by-step instructions for managing and replying to client requests through the ChefGear admin portal.

## Overview

The Client Requests system automatically handles:
- **Email notifications** for all form submissions (Contact Us, Special Requests)
- **Admin notifications** when new requests are received
- **Client confirmations** when requests are submitted
- **Response emails** when admins reply to requests

## Step-by-Step Guide for Replying to Client Requests

### 1. Access Client Requests

1. Log into the admin portal
2. Navigate to **Client Requests** from the main menu
3. You'll see a dashboard with:
   - Total requests count
   - Pending requests
   - In progress requests
   - Completed requests

### 2. Filter and Search Requests

1. Use the **search bar** to find specific requests by:
   - Client name
   - Company name
   - Email address

2. Apply **filters** to narrow down results:
   - **Status Filter**: All, Pending, In Progress, Completed
   - **SLA Filter**: All, Standard, Priority, Urgent

### 3. View Request Details

1. Click the **"View"** button (eye icon) on any request
2. Review the complete request information:
   - Client contact details
   - Request type and priority level
   - Full message content
   - Submission timestamp

### 4. Respond to a Request

1. Click the **"Reply"** button on the request
2. A response dialog will open with:
   - Pre-filled recipient email
   - Subject line (editable)
   - Message composition area

3. **Compose your response**:
   - Write a professional, helpful response
   - Address all points mentioned in the original request
   - Include any relevant attachments or links if needed

4. **Send the response**:
   - Click **"Send Response"**
   - The system will automatically:
     - Send the email to the client
     - Update the request status to "In Progress"
     - Log the response in the system

### 5. Update Request Status

After responding, you can update the request status:
- **Pending**: Initial status for new requests
- **In Progress**: Request is being handled
- **Completed**: Request has been fully resolved

### 6. Convert to Client (Optional)

For promising leads:
1. Click **"Convert to Client"** button
2. The system will:
   - Create a new client record
   - Pre-fill information from the request
   - Add the client to your database

## Email Notification System

### Automatic Notifications

The system automatically sends emails for:

#### When a Contact Form is Submitted:
1. **Admin Notification**: Sent to `info@chefgear.com`
   - Contains all form details
   - Highlights priority level
   - Includes client contact information

2. **Client Confirmation**: Sent to the client
   - Confirms receipt of their request
   - Provides expected response timeframe
   - Includes contact information for urgent matters

#### When Admin Responds:
1. **Response Email**: Sent to the client
   - Contains the admin's response
   - Maintains professional ChefGear branding
   - Includes company contact information

### Response Time Guidelines

Based on SLA levels:
- **Urgent**: Within 2-4 hours during business hours
- **Priority**: Within 24 hours
- **Standard**: Within 2-3 business days

## Best Practices

### 1. Response Quality
- Always address the client by name
- Reference their specific request details
- Provide clear, actionable information
- Include relevant product information or links
- End with next steps or call-to-action

### 2. Professional Communication
- Use proper grammar and spelling
- Maintain a friendly but professional tone
- Include your name and title in responses
- Provide direct contact information when appropriate

### 3. Follow-up
- Set reminders for complex requests
- Follow up on urgent matters within the promised timeframe
- Update request status as work progresses
- Close requests only when fully resolved

### 4. Data Management
- Export request data regularly for reporting
- Keep client information updated
- Convert qualified leads to clients promptly
- Maintain accurate status updates

## Troubleshooting

### Email Delivery Issues
If emails are not being delivered:
1. Check the email service configuration
2. Verify the SENDER_API_KEY in environment variables
3. Check spam folders for test emails
4. Contact system administrator if issues persist

### System Performance
For optimal performance:
- Regularly update request statuses
- Archive old completed requests
- Monitor system logs for errors
- Keep the client database clean and updated

## Contact for Support

For technical issues or questions about the system:
- Email: tech-support@chefgear.com
- Phone: +90 (212) 555-1234 ext. 101
- Internal Slack: #admin-support

---

*This guide is part of the ChefGear Admin Portal documentation. Last updated: December 2024*