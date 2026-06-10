import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrderGateway {
  @WebSocketServer()
  server!: Server;

  // Join order room (customer + rider join same room)
  @SubscribeMessage('joinOrderRoom')
  handleJoinRoom(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(orderId);

    return {
      event: 'joined',
      data: `Joined order room ${orderId}`,
    };
  }

  // Rider sends live location
  @SubscribeMessage('riderLocation')
  handleRiderLocation(
    @MessageBody()
    data: { orderId: string; lat: number; lng: number },

    @ConnectedSocket()
    client: Socket,
  ) {
    // broadcast to everyone in same order room
    this.server.to(data.orderId).emit('liveLocation', {
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date(),
    });
  }

  // Order status updates (admin/rider -> customer)
  @SubscribeMessage('orderStatus')
  handleStatusUpdate(
    @MessageBody()
    data: { orderId: string; status: string },
  ) {
    this.server.to(data.orderId).emit('statusUpdate', {
      status: data.status,
      updatedAt: new Date(),
    });
  }
}