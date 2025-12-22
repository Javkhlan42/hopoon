import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(userId: string, subject: string, message: string): Promise<void> {
    try {
      // In production, fetch user email from user service
      const userEmail = `user-${userId}@example.com`;

      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Hop-On <noreply@hopon.mn>',
        to: userEmail,
        subject,
        html: this.generateEmailTemplate(subject, message),
      });

      this.logger.log(`Email sent to ${userEmail}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  private generateEmailTemplate(subject: string, message: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Hop-On</h1>
            </div>
            <div class="content">
              <h2>${subject}</h2>
              <p>${message}</p>
            </div>
            <div class="footer">
              <p>© 2024 Hop-On. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
