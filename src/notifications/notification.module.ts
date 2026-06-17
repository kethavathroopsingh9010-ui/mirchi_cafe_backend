import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { User } from '../users/entities/user.entity';
import { NotificationProcessor } from './processors/notification.processor';
import { FcmService } from './fcm.service';
import { RealtimeModule } from '../realtime/realtime.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    RealtimeModule, 
    BullModule.registerQueue({
      name: 'background-tasks',
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationProcessor, FcmService],
  exports: [NotificationService], 
})
export class NotificationModule {}