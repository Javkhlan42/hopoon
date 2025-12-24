import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendSMS(userId: string, message: string): Promise<void> {
    try {
      // In production, integrate with Twilio or similar service
      // const twilio = require('twilio')(
      //   process.env.TWILIO_ACCOUNT_SID,
      //   process.env.TWILIO_AUTH_TOKEN
      // );
      
      // Get user phone from user service
      const userPhone = `+976-${userId.substring(0, 8)}`;

      // Mock SMS sending
      this.logger.log(`[MOCK] SMS sent to ${userPhone}: ${message}`);
      
      // Actual Twilio implementation:
      // await twilio.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: userPhone,
      // });
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      throw error;
    }
  }
}
