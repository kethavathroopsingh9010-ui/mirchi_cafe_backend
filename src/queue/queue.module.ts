import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    // Register our primary background task queue for offloading heavy tasks
    BullModule.registerQueue({
      name: 'background-tasks',
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}