import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    // Smart Default for Gmail if HOST is missing
    let host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT'); // Restore port variable

    if (!host && user && user.includes('@gmail.com')) {
      host = 'smtp.gmail.com';
      this.logger.log('SMTP_HOST not found, inferring Gmail host: smtp.gmail.com');
    }

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465, // true for 465, false for other ports
        auth: {
          user,
          pass,
        },
      });
      this.logger.log(`EmailService initialized with host: ${host}`);
    } else {
      this.logger.warn('SMTP credentials not found. EmailService will log emails to console instead of sending.');
    }
  }

  async sendEmail(to: string, subject: string, html: string, attachments?: any[]) {
    if (!this.transporter) {
      this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM') || '"Sistema SaaS" <noreply@saas.com>',
        to,
        subject,
        html,
        attachments,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Error sending email to ${to}`, error);
      throw error;
    }
  }
}
