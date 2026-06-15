import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

interface AuthSocket extends Socket {
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  // ----------------------------
  // AUTH CONNECTION
  // ----------------------------
  async handleConnection(client: AuthSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token);
      client.user = decoded; // attach user to socket
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // ----------------------------
  // JOIN ORDER ROOM (SECURE)
  // ----------------------------
  @SubscribeMessage('joinOrderRoom')
  async handleJoinRoom(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: AuthSocket,
  ) {
    // TODO: replace with real DB check
    const userId = client.user?.sub;

    const isAllowed = await this.checkUserAccessToOrder(userId, orderId);

    if (!isAllowed) {
      return {
        event: 'error',
        data: 'Not allowed to join this order room',
      };
    }

    client.join(orderId);

    return {
      event: 'joined',
      data: `Joined order room ${orderId}`,
    };
  }

  // ----------------------------
  // RIDER LIVE LOCATION
  // ----------------------------
  @SubscribeMessage('riderLocation')
  handleRiderLocation(
    @MessageBody()
    data: { orderId: string; lat: number; lng: number },

    @ConnectedSocket()
    client: AuthSocket,
  ) {
    // Optional: store in DB/Redis here
    this.saveLastLocation(data.orderId, data.lat, data.lng);

    this.server.to(data.orderId).emit('liveLocation', {
      lat: data.lat,
      lng: data.lng,
      riderId: client.user?.sub,
      timestamp: new Date(),
    });
  }

  // ----------------------------
  // ORDER STATUS UPDATE
  // ----------------------------
  @SubscribeMessage('orderStatus')
  handleStatusUpdate(
    @MessageBody()
    data: { orderId: string; status: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    this.server.to(data.orderId).emit('statusUpdate', {
      status: data.status,
      updatedBy: client.user?.sub,
      updatedAt: new Date(),
    });
  }

  // ----------------------------
  // MOCK: ACCESS CHECK (replace with DB)
  // ----------------------------
  private async checkUserAccessToOrder(userId: string, orderId: string) {
    // Replace with real DB logic:
    // - is customer?
    // - is assigned rider?
    // - is admin?

    return true;
  }

  // ----------------------------
  // MOCK: SAVE LOCATION
  // ----------------------------
  private saveLastLocation(orderId: string, lat: number, lng: number) {
    // Replace with Redis or DB update
    console.log(`Saving location for ${orderId}: ${lat}, ${lng}`);
  }

  // Add this inside the OrderGateway class
  public emitStatusUpdate(orderId: string, status: string, userId: string) {
    this.server.to(orderId).emit('statusUpdate', {
      status: status,
      updatedBy: userId,
      updatedAt: new Date(),
    });
    console.log(`📡 Emitting status update to order room: ${orderId}`);
  }
}