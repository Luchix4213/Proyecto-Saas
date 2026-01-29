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
    const host = this.configService.get<string>('SMTP_HOST');
    const portStr = this.configService.get<string>('SMTP_PORT');
    const secureStr = this.configService.get<string>('SMTP_SECURE');

    const port = portStr ? parseInt(portStr, 10) : 587;
    // Use SMTP_SECURE if provided, otherwise check if port is 465
    const secure = secureStr !== undefined ? (secureStr === 'true' || secureStr === '1') : (port === 465);

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        // Add timeouts to prevent hanging sockets
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });
      this.logger.log(`EmailService initialized with host: ${host}, port: ${port}, secure: ${secure}`);
    } else {
      this.logger.warn('SMTP credentials incomplete. EmailService will log emails to console.');
      if (!host) this.logger.warn('Missing SMTP_HOST');
      if (!user) this.logger.warn('Missing SMTP_USER');
      if (!pass) this.logger.warn('Missing SMTP_PASS');
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
