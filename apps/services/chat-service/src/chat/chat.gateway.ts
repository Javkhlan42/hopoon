import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private userSockets: Map<string, string[]> = new Map();

  constructor(
    private messagesService: MessagesService,
    private conversationsService: ConversationsService,
  ) {}

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
        this.broadcastUserStatus(userId, 'offline');
        break;
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthentication(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string },
  ) {
    const { userId } = payload;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }

    this.userSockets.get(userId).push(client.id);
    this.logger.log(`User ${userId} authenticated with socket ${client.id}`);

    client.emit('authenticated', { success: true });
    this.broadcastUserStatus(userId, 'online');
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    try {
      // Support both conversation-based and ride-based messaging
      if (payload.rideId) {
        // Ride-based messaging (simple broadcast)
        const roomName = `ride:${payload.rideId}`;
        const messageData = {
          id: Date.now().toString(),
          rideId: payload.rideId,
          senderId: payload.userId || 'unknown',
          senderName: payload.senderName,
          content: payload.content,
          type: payload.type || 'text',
          timestamp: new Date().toISOString(),
        };

        // Broadcast to ride room (excluding sender)
        client.to(roomName).emit('message', messageData);

        // Send confirmation to sender
        client.emit('message_sent', { success: true, message: messageData });

        this.logger.log(
          `Message sent to ride ${payload.rideId} from ${payload.userId}`,
        );
        return;
      }

      // Conversation-based messaging (original logic)
      const message = await this.messagesService.sendMessage(payload.userId, {
        conversationId: payload.conversationId,
        type: payload.type,
        content: payload.content,
        metadata: payload.metadata,
      });

      const conversation = await this.conversationsService.getConversationById(
        payload.userId,
        payload.conversationId,
      );

      // Send to all participants
      conversation.participantIds.forEach((participantId) => {
        if (participantId !== payload.userId) {
          this.sendToUser(participantId, 'new_message', {
            ...message,
            conversation: {
              id: conversation.id,
              type: conversation.type,
              title: conversation.title,
            },
          });
        }
      });

      client.emit('message_sent', { success: true, message });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { userId: string; conversationId: string; isTyping: boolean },
  ) {
    this.server.to(payload.conversationId).emit('user_typing', {
      userId: payload.userId,
      isTyping: payload.isTyping,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string; conversationId: string },
  ) {
    try {
      await this.messagesService.markAsRead(payload.userId, {
        conversationId: payload.conversationId,
      });

      client.emit('marked_read', { success: true });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    client.join(payload.conversationId);
    this.logger.log(
      `Socket ${client.id} joined conversation ${payload.conversationId}`,
    );
  }

  @SubscribeMessage('join_ride')
  handleJoinRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { rideId: string },
  ) {
    const roomName = `ride:${payload.rideId}`;
    client.join(roomName);
    this.logger.log(`Socket ${client.id} joined ride ${payload.rideId}`);
    client.emit('joined_ride', { success: true, rideId: payload.rideId });
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    client.leave(payload.conversationId);
    this.logger.log(
      `Socket ${client.id} left conversation ${payload.conversationId}`,
    );
  }

  sendToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);

    if (sockets && sockets.length > 0) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });

      this.logger.log(
        `Event '${event}' sent to user ${userId} via ${sockets.length} socket(s)`,
      );
    }
  }

  broadcastUserStatus(userId: string, status: 'online' | 'offline') {
    this.server.emit('user_status', { userId, status });
  }

  sendToConversation(conversationId: string, event: string, data: any) {
    this.server.to(conversationId).emit(event, data);
  }
}
