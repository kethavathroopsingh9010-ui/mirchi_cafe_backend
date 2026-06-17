import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as path from 'path';

// Pull the underlying raw v10+ modular components dynamically
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

@Injectable()
export class FcmService implements OnModuleInit {
  private readonly logger = new Logger(FcmService.name);

  onModuleInit() {
    try {
      const activeApps = getApps();

      if (activeApps.length === 0) {
        // 🌟 STRATEGY FIX: Read the JSON configuration asset file directly from disk.
        // This completely eliminates .env string quote/backslash parsing bugs.
        const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');

        initializeApp({
          credential: cert(serviceAccountPath),
        });
        this.logger.log('Firebase Admin SDK successfully initialized via local asset path.');
      } else {
        this.logger.log('Firebase App already initialized, reusing connection.');
      }
    } catch (error) {
      this.logger.error('Firebase initialization critical failure!', error);
    }
  }

  /**
   * Sends a targeted push notification to a specific device token
   */
  async sendPushNotification(token: string, title: string, message: string, type: string) {
    const payload = {
      notification: {
        title,
        body: message,
      },
      data: {
        type,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
    };

    try {
      // 🌟 Pull the active core engine instance dynamically right at delivery time to prevent undefined errors
      const messenger = getMessaging();
      
      const response = await messenger.send({
        token,
        ...payload,
      });
      this.logger.log(`[FCM Success] Message sent successfully: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`[FCM Failure] Error sending push payload to token: ${token}`, error);
      throw error;
    }
  }
}