import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { NotificationService } from '../notification.service';
import { FcmService } from '../fcm.service';
import { User } from '../../users/entities/user.entity';
import { OrderGateway } from '../../realtime/order.gateway'; // 🌟 FIX: Imported the OrderGateway namespace cleanly

@Processor('background-tasks')
@Injectable()
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly fcmService: FcmService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // 🌟 FIX: Injected the WebSocket OrderGateway provider instance
    private readonly orderGateway: OrderGateway,
  ) {
    super();
  }

  // This method automatically picks up jobs pushed to the 'background-tasks' queue
  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing background job ${job.id} of type ${job.name}...`);

    switch (job.name) {
      case 'send-fcm-notification': {
        const { userId, title, message, type } = job.data;

        try {
          // 1. Process database logging using your verified service
          const savedNotification = await this.notificationService.create({
            userId,
            title,
            message,
            type,
          });
          this.logger.log(`[Job Success] Notification persistent entry saved: ${savedNotification.id}`);

          // 🌟 STEP 2: HYBRID FALLBACK ROUTING
          // Check if user is actively online via WebSockets to send an instant in-app alert banner
          const isUserOnline = this.orderGateway.sendInAppAlert(userId, { title, message, type });

          if (isUserOnline) {
            this.logger.log(`⚡ [Realtime Routed] User ${userId} is currently online. Dispatched via active WebSocket.`);
            return { 
              status: 'completed_via_websocket', 
              notificationId: savedNotification.id 
            };
          }

          // 🌟 STEP 3: FALLBACK TO PUSH OVER DISK CERTS (User is offline from WebSockets)
          this.logger.log(`User ${userId} is offline from WebSockets. Routing fallback transmission via FCM...`);
          const user = await this.userRepository.findOne({ where: { id: userId } });

          if (!user) {
            this.logger.warn(`[Job Dropped] Target user ${userId} does not exist in PostgreSQL.`);
            return { status: 'dropped', reason: 'User not found' };
          }

          if (!user.fcmToken) {
            this.logger.warn(`[Job Skipped] User ${user.name} (${userId}) has no registered mobile device token.`);
            return { status: 'skipped', reason: 'Missing FCM token', notificationId: savedNotification.id };
          }

          // Dispatch live FCM push transmission to the user's actual phone token
          this.logger.log(`Dispatching live FCM push transmission for user: ${user.name} (${userId})`);
          const fcmResponse = await this.fcmService.sendPushNotification(
            user.fcmToken,
            title,
            message,
            type,
          );

          return { 
            status: 'completed_via_fcm', 
            notificationId: savedNotification.id,
            fcmMessageId: fcmResponse 
          };
        } catch (error) {
          this.logger.error(`[Job Failed] Error processing notification for user ${userId}`, error);
          throw error; // Rethrowing causes BullMQ to invoke automated retries safely
        }
      }

      default:
        this.logger.warn(`Unknown job type encountered: ${job.name}`);
        throw new Error(`Job type ${job.name} not supported`);
    }
  }
}