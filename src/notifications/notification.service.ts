import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateNotificationDto) {
    try {
      const user = await this.userRepo.findOneBy({ id: dto.userId });
      if (!user) throw new NotFoundException('User not found');

      const notification = this.notificationRepo.create({
        user,
        title: dto.title,
        message: dto.message,
        type: dto.type,
      });

      return await this.notificationRepo.save(notification);
    } catch (error: any) {
      console.error('--- NOTIFICATION ENGINE CRASH LOG ---');
      console.error(error);
      console.error('-------------------------------------');
      throw error;
    }
  }

  async findUserNotifications(userId: string) {
    return this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    const notification = await this.notificationRepo.findOneBy({ id });
    if (!notification) throw new NotFoundException('Not found');

    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }
}