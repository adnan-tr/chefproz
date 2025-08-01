// Backend API route for sending emails
// This should be deployed as a serverless function or backend endpoint

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ContactFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  request_type: string;
  sla_level: string;
  country?: string;
  attachment_url?: string;
  file_attachment?: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const formData: ContactFormData = req.body;

    // Send notification to admin
    const adminEmailHtml = generateAdminNotificationHtml(formData);
    const adminResult = await resend.emails.send({
      from: 'noreply@chefgear.com',
      to: 'equiprime2025@gmail.com',
      subject: `New Contact Form Submission - ${formData.request_type}`,
      html: adminEmailHtml,
    });

    // Send confirmation to client
    const clientEmailHtml = generateClientConfirmationHtml(formData);
    const clientResult = await resend.emails.send({
      from: 'noreply@chefgear.com',
      to: formData.email,
      subject: 'Thank you for contacting ChefGear - We\'ve received your message',
      html: clientEmailHtml,
    });

    res.status(200).json({ 
      success: true, 
      adminResult, 
      clientResult 
    });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

function generateAdminNotificationHtml(formData: ContactFormData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Form Submission</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #374151; }
        .value { margin-top: 5px; padding: 10px; background: white; border-radius: 5px; }
        .priority { padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
        .priority.urgent { background: #fef2f2; color: #dc2626; }
        .priority.priority { background: #fef3c7; color: #d97706; }
        .priority.standard { background: #f3f4f6; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Form Submission</h1>
          <p>ChefGear Professional Kitchen Equipment</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Request Type:</div>
            <div class="value">${formData.request_type}</div>
          </div>
          <div class="field">
            <div class="label">SLA Level:</div>
            <div class="value">
              <span class="priority ${formData.sla_level.toLowerCase()}">${formData.sla_level.toUpperCase()}</span>
            </div>
          </div>
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${formData.name}</div>
          </div>
          <div class="field">
            <div class="label">Company:</div>
            <div class="value">${formData.company}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value">${formData.email}</div>
          </div>
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value">${formData.phone}</div>
          </div>
          ${formData.country ? `
          <div class="field">
            <div class="label">Country:</div>
            <div class="value">${formData.country}</div>
          </div>
          ` : ''}
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${formData.message.replace(/\n/g, '<br>')}</div>
          </div>
          ${formData.attachment_url || formData.file_attachment ? `
          <div class="field">
            <div class="label">Attachment:</div>
            <div class="value">
              ${formData.attachment_url ? `<a href="${formData.attachment_url}" target="_blank">View Attachment</a>` : ''}
              ${formData.file_attachment ? `<p>File: ${formData.file_attachment}</p>` : ''}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateClientConfirmationHtml(formData: ContactFormData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Thank you for contacting ChefGear</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Contacting ChefGear</h1>
          <p>Professional Kitchen & Catering Solutions</p>
        </div>
        <div class="content">
          <p>Dear ${formData.name},</p>
          <p>Thank you for reaching out to ChefGear. We have received your ${formData.request_type.toLowerCase()} request and our team will review it shortly.</p>
          <p><strong>Your Request Details:</strong></p>
          <ul>
            <li><strong>Request Type:</strong> ${formData.request_type}</li>
            <li><strong>Priority Level:</strong> ${formData.sla_level}</li>
            <li><strong>Company:</strong> ${formData.company}</li>
          </ul>
          <p>Based on your priority level (${formData.sla_level}), you can expect a response from our team within:</p>
          <ul>
            <li><strong>Urgent:</strong> 2-4 hours</li>
            <li><strong>Priority:</strong> 24 hours</li>
            <li><strong>Standard:</strong> 48-72 hours</li>
          </ul>
          <p>If you have any urgent questions, please don't hesitate to contact us directly.</p>
          <p>Best regards,<br>The ChefGear Team</p>
        </div>
        <div class="footer">
          <p>ChefGear - Professional Kitchen & Catering Solutions</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}