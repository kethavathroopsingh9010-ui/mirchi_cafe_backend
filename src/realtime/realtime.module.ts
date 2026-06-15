import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrderGateway } from './order.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [OrderGateway],
  exports: [OrderGateway],
})
export class RealtimeModule {}