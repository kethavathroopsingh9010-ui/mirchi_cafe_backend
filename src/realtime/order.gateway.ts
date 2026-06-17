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
import { Logger } from '@nestjs/common';
import Redis from 'ioredis';

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
  
  private readonly logger = new Logger(OrderGateway.name);

  // MAP TO TRACK ACTIVE SESSIONS: Maps a unique userId to their active Socket ID
  public static onlineUsers = new Map<string, string>();

  private readonly redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
  });

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

      // AUTOMATIC TRACKING: Add user to online map instantly upon successful verification
      if (decoded?.sub) {
        OrderGateway.onlineUsers.set(decoded.sub, client.id);
        this.logger.log(`User connected & mapped: User ${decoded.sub} -> Socket ${client.id}`);
      }
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // AUTOMATIC CLEANUP: Strip the user from our map memory when they disconnect
    if (client.user?.sub) {
      OrderGateway.onlineUsers.delete(client.user.sub);
      this.logger.log(`User ${client.user.sub} disconnected. Removed socket session registration.`);
    }
  }

  // NEW UTILITY METHOD: Emits a targeted, in-app notification banner if the user is online
  public sendInAppAlert(userId: string, payload: { title: string; message: string; type: string }): boolean {
    const socketId = OrderGateway.onlineUsers.get(userId);
    
    if (socketId && this.server) {
      this.server.to(socketId).emit('inAppNotification', payload);
      this.logger.log(`⚡ [WebSocket Success] Live in-app alert dispatched directly to user socket session: ${userId}`);
      return true; // Successfully delivered via WebSocket
    }
    
    return false; // User is currently offline from WebSockets
  }

  // ----------------------------
  // JOIN ORDER ROOM (SECURE)
  // ----------------------------
  @SubscribeMessage('joinOrderRoom')
  async handleJoinRoom(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: AuthSocket,
  ) {
    const userId = client.user?.sub;
    const isAllowed = await this.checkUserAccessToOrder(userId, orderId);

    if (!isAllowed) {
      return {
        event: 'error',
        data: 'Not allowed to join this order room',
      };
    }

    client.join(orderId);
    this.logger.log(`Socket ${client.id} joined room for Order #${orderId}`);

    // 🌟 OPTIMIZATION: Instantly transmit last known cached position so maps don't look empty on load
    try {
      const cachedLocation = await this.redisClient.get(`order:location:${orderId}`);
      if (cachedLocation) {
        client.emit('liveLocation', JSON.parse(cachedLocation));
        this.logger.log(`🎯 Pushed cached initial location payload to user for Order #${orderId}`);
      }
    } catch (cacheError) {
      this.logger.error(`Error reading initial location cache state for Order #${orderId}`, cacheError);
    }

    return {
      event: 'joined',
      data: `Joined order room ${orderId}`,
    };
  }

  // ----------------------------
  // RIDER LIVE LOCATION
  // ----------------------------
  @SubscribeMessage('riderLocation')
  async handleRiderLocation(
    @MessageBody()
    data: { orderId: string; lat: number; lng: number },
    @ConnectedSocket()
    client: AuthSocket,
  ) {
    const locationPayload = {
      lat: data.lat,
      lng: data.lng,
      riderId: client.user?.sub,
      timestamp: new Date(),
    };

    // 🌟 ASYNC WRITER: Offloads tracking data structure into Redis memory cache array
    await this.saveLastLocation(data.orderId, data.lat, data.lng, locationPayload.riderId);

    // Broadcast telemetry to the specific active room channel instantly
    this.server.to(data.orderId).emit('liveLocation', locationPayload);
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
    return true;
  }

  // ----------------------------
  // HIGH-SPEED REDIS CACHE OPERATIONS
  // ----------------------------
  private async saveLastLocation(orderId: string, lat: number, lng: number, riderId: string) {
    try {
      const redisKey = `order:location:${orderId}`;
      const dataString = JSON.stringify({
        lat,
        lng,
        riderId,
        timestamp: new Date(),
      });
      
      // 🌟 PERSISTENCE: Save coordinates string payload with 2-hour expiration safety limit
      await this.redisClient.set(redisKey, dataString, 'EX', 7200);
    } catch (err) {
      this.logger.error(`Failed to cache live telemetry location coordinates for Order #${orderId}`, err);
    }
  }

  // ----------------------------
  // EXTERNAL EVENT DISPATCHER
  // ----------------------------
  public emitStatusUpdate(orderId: string, status: string, userId: string) {
    this.server.to(orderId).emit('statusUpdate', {
      status: status,
      updatedBy: userId,
      updatedAt: new Date(),
    });
    this.logger.log(`📡 Emitting status update to order room: ${orderId}`);
  }
}