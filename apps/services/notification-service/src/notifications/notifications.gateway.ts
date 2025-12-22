import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets: Map<string, string[]> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove socket from user mapping
    for (const [userId, sockets] of this.userSockets.entries()) {
      const index = sockets.indexOf(client.id);
      if (index > -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthentication(client: Socket, payload: { userId: string }) {
    const { userId } = payload;
    
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }
    
    this.userSockets.get(userId).push(client.id);
    this.logger.log(`User ${userId} authenticated with socket ${client.id}`);
    
    client.emit('authenticated', { success: true });
  }

  sendToUser(userId: string, notification: any) {
    const sockets = this.userSockets.get(userId);
    
    if (sockets && sockets.length > 0) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('notification', notification);
      });
      
      this.logger.log(`Notification sent to user ${userId} via ${sockets.length} socket(s)`);
    } else {
      this.logger.warn(`User ${userId} has no active WebSocket connections`);
    }
  }

  broadcast(notification: any) {
    this.server.emit('notification', notification);
    this.logger.log('Broadcast notification to all connected clients');
  }
}
