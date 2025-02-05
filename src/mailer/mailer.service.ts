import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerService {
  async sendMail(to: string, subject: string, content: string): Promise<void> {
    // Implémentation du service d'envoi d'email
    console.log(`Sending mail to ${to} with subject: ${subject}`);
  }
} 