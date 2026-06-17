import { Controller, Get, Post, Body, Param, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly service: NotificationService,
    
    // 🌟 Inject the Redis background task producer queue handle directly
    @InjectQueue('background-tasks') 
    private readonly taskQueue: Queue,
  ) {}

  /**
   * 🔀 OPTION A: SYNCHRONOUS ROUTE (Direct to DB)
   * URL: POST http://localhost:5000/notifications
   */
  @Post()
  createDirect(@Body() dto: CreateNotificationDto) {
    return this.service.create(dto);
  }

  /**
   * 🚀 OPTION B: ASYNCHRONOUS ROUTE (Offloads to Redis Queue)
   * URL: POST http://localhost:5000/notifications/queue
   */
  @Post('queue')
  async createAsync(@Body() dto: CreateNotificationDto) {
    // Push the notification payload straight onto the Redis message broker
    const job = await this.taskQueue.add(
      'send-fcm-notification',
      {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
      },
      {
        attempts: 3,       // Automatically retry up to 3 times if an external network or DB drops
        backoff: 5000,     // Wait 5 seconds between retry attempts
      },
    );

    return {
      success: true,
      jobId: job.id,
      message: 'Notification task offloaded to background worker smoothly.',
    };
  }

  /**
   * 📬 GET /notifications/:userId
   * Pulls the persistent historical log stack directly out of PostgreSQL for the mobile inbox view
   */
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  async findUser(@Param('userId') userId: string) {
    const notifications = await this.service.findUserNotifications(userId);
    return {
      success: true,
      count: notifications.length,
      data: notifications,
    };
  }

  /**
   * 📂 PATCH /notifications/:id/read
   * Allows users to mark notification instances as read from the mobile drawer UI
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markRead(@Param('id') id: string) {
    const updatedNotification = await this.service.markAsRead(id);
    return {
      success: true,
      data: updatedNotification,
    };
  }
}