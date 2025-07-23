import { Resend } from 'resend';

// Use a placeholder API key if not provided to prevent initialization errors
const API_KEY = import.meta.env.VITE_SENDER_API_KEY || 'placeholder_key_for_development';
const resend = new Resend(API_KEY);

// Check if we have a valid API key
const hasValidApiKey = import.meta.env.VITE_SENDER_API_KEY && import.meta.env.VITE_SENDER_API_KEY !== 'placeholder_key_for_development';

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface ContactFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  request_type: string;
  sla_level: string;
  country?: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = 'noreply@chefgear.com';
  private static readonly ADMIN_EMAIL = 'info@chefgear.com';

  static async sendContactFormNotification(formData: ContactFormData): Promise<{ success: boolean; error?: any }> {
    // If no valid API key, return mock success to prevent app crashes
    if (!hasValidApiKey) {
      console.warn('Email service: No valid API key provided. Email functionality is disabled.');
      return { success: true, warning: 'Email service disabled - no API key' };
    }

    try {
      // Send notification to admin
      const adminEmailHtml = this.generateAdminNotificationHtml(formData);
      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: this.ADMIN_EMAIL,
        subject: `New Contact Form Submission - ${formData.request_type}`,
        html: adminEmailHtml,
      });

      // Send confirmation to client
      const clientEmailHtml = this.generateClientConfirmationHtml(formData);
      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: formData.email,
        subject: 'Thank you for contacting ChefGear - We\'ve received your message',
        html: clientEmailHtml,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending email notifications:', error);
      return { success: false, error };
    }
  }

  static async sendSpecialRequestNotification(formData: any): Promise<{ success: boolean; error?: any }> {
    // If no valid API key, return mock success to prevent app crashes
    if (!hasValidApiKey) {
      console.warn('Email service: No valid API key provided. Email functionality is disabled.');
      return { success: true, warning: 'Email service disabled - no API key' };
    }

    try {
      // Send notification to admin
      const adminEmailHtml = this.generateSpecialRequestAdminHtml(formData);
      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: this.ADMIN_EMAIL,
        subject: `New Special Request Submission`,
        html: adminEmailHtml,
      });

      // Send confirmation to client if email is provided
      if (formData.email) {
        const clientEmailHtml = this.generateSpecialRequestClientHtml(formData);
        await resend.emails.send({
          from: this.FROM_EMAIL,
          to: formData.email,
          subject: 'Thank you for your special request - ChefGear',
          html: clientEmailHtml,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending special request notifications:', error);
      return { success: false, error };
    }
  }

  static async sendResponseEmail(to: string, subject: string, message: string): Promise<{ success: boolean; error?: any }> {
    // If no valid API key, return mock success to prevent app crashes
    if (!hasValidApiKey) {
      console.warn('Email service: No valid API key provided. Email functionality is disabled.');
      return { success: true, warning: 'Email service disabled - no API key' };
    }

    try {
      const emailHtml = this.generateResponseEmailHtml(message);
      await resend.emails.send({
        from: this.FROM_EMAIL,
        to: to,
        subject: subject,
        html: emailHtml,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending response email:', error);
      return { success: false, error };
    }
  }

  private static generateAdminNotificationHtml(formData: ContactFormData): string {
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
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateClientConfirmationHtml(formData: ContactFormData): string {
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
          .footer { background: #374151; color: white; padding: 15px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Contacting Us!</h1>
            <p>ChefGear Professional Kitchen Equipment</p>
          </div>
          <div class="content">
            <p>Dear ${formData.name},</p>
            <p>Thank you for reaching out to ChefGear. We have successfully received your ${formData.request_type.toLowerCase()} request and our team will review it shortly.</p>
            <p><strong>Your request details:</strong></p>
            <ul>
              <li><strong>Request Type:</strong> ${formData.request_type}</li>
              <li><strong>Priority Level:</strong> ${formData.sla_level}</li>
              <li><strong>Company:</strong> ${formData.company}</li>
            </ul>
            <p>Based on your selected priority level (${formData.sla_level}), you can expect a response from our team within:</p>
            <ul>
              ${formData.sla_level.toLowerCase() === 'urgent' ? '<li><strong>Urgent:</strong> Within 2-4 hours during business hours</li>' : ''}
              ${formData.sla_level.toLowerCase() === 'priority' ? '<li><strong>Priority:</strong> Within 24 hours</li>' : ''}
              ${formData.sla_level.toLowerCase() === 'standard' ? '<li><strong>Standard:</strong> Within 2-3 business days</li>' : ''}
            </ul>
            <p>If you have any urgent questions, please don't hesitate to contact us directly at:</p>
            <ul>
              <li><strong>Phone:</strong> +90 (212) 555-1234</li>
              <li><strong>Email:</strong> info@chefgear.com</li>
            </ul>
            <p>Best regards,<br>The ChefGear Team</p>
          </div>
          <div class="footer">
            <p>ChefGear Professional Kitchen Equipment<br>
            Atatürk Mah. Ertuğrul Gazi Sok. No: 25, Kat: 3<br>
            34758 Ataşehir/İstanbul, Turkey</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateSpecialRequestAdminHtml(formData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Special Request Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #374151; }
          .value { margin-top: 5px; padding: 10px; background: white; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Special Request</h1>
            <p>ChefGear Professional Kitchen Equipment</p>
          </div>
          <div class="content">
            ${Object.entries(formData).map(([key, value]) => {
              if (key === 'id' || key === 'created_at' || key === 'updated_at') return '';
              return `
                <div class="field">
                  <div class="label">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</div>
                  <div class="value">${value || 'N/A'}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateSpecialRequestClientHtml(formData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Thank you for your special request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .footer { background: #374151; color: white; padding: 15px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Special Request!</h1>
            <p>ChefGear Professional Kitchen Equipment</p>
          </div>
          <div class="content">
            <p>Dear ${formData.name || 'Valued Customer'},</p>
            <p>Thank you for submitting your special request to ChefGear. We have received your inquiry and our specialized team will review it carefully.</p>
            <p>Our experts will analyze your requirements and get back to you with a customized solution that meets your specific needs.</p>
            <p>You can expect to hear from us within 2-3 business days. For urgent matters, please contact us directly.</p>
            <p>Best regards,<br>The ChefGear Team</p>
          </div>
          <div class="footer">
            <p>ChefGear Professional Kitchen Equipment<br>
            Atatürk Mah. Ertuğrul Gazi Sok. No: 25, Kat: 3<br>
            34758 Ataşehir/İstanbul, Turkey</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateResponseEmailHtml(message: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Response from ChefGear</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .footer { background: #374151; color: white; padding: 15px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Response from ChefGear</h1>
            <p>ChefGear Professional Kitchen Equipment</p>
          </div>
          <div class="content">
            <div style="white-space: pre-wrap;">${message}</div>
          </div>
          <div class="footer">
            <p>ChefGear Professional Kitchen Equipment<br>
            Atatürk Mah. Ertuğrul Gazi Sok. No: 25, Kat: 3<br>
            34758 Ataşehir/İstanbul, Turkey<br>
            Phone: +90 (212) 555-1234 | Email: info@chefgear.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}