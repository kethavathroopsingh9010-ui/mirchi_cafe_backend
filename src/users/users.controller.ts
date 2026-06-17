import { Controller, Patch, Param, Body, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Updates the FCM registration token for a specific user profile
   */
  @Patch(':userId/fcm-token')
  @HttpCode(HttpStatus.OK)
  async updateFcmToken(
    @Param('userId') userId: string,
    @Body('fcmToken') fcmToken: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    user.fcmToken = fcmToken;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Mobile device FCM token bound to profile successfully.',
    };
  }
}