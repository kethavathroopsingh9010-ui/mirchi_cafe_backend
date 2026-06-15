import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.service.create(dto);
  }

  @Get(':userId')
  findUser(@Param('userId') userId: string) {
    return this.service.findUserNotifications(userId);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}