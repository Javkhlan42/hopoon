/**
 * Socket.IO Client for Real-time Chat
 * Direct connection to Chat Service (http://localhost:3006)
 */

import { io, Socket } from 'socket.io-client';

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_URL || 'http://localhost:3006';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  type: 'text' | 'image' | 'file';
  createdAt: string;
  read: boolean;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  conversationId: string;
  isTyping: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.userId = userId;
    this.socket = io(CHAT_SERVICE_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      // Authenticate after connection
      this.authenticate(userId);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  private authenticate(userId: string) {
    if (!this.socket) return;
    
    this.socket.emit('authenticate', { userId });
    
    this.socket.once('authenticated', (data) => {
      console.log('✅ Authenticated:', data);
    });
  }

  // Join conversation room
  joinConversation(conversationId: string) {
    if (!this.socket) return;
    
    this.socket.emit('join_conversation', { conversationId });
    console.log('📥 Joined conversation:', conversationId);
  }

  // Leave conversation room
  leaveConversation(conversationId: string) {
    if (!this.socket) return;
    
    this.socket.emit('leave_conversation', { conversationId });
    console.log('📤 Left conversation:', conversationId);
  }

  // Join ride room
  joinRide(rideId: string) {
    if (!this.socket) return;
    
    this.socket.emit('join_ride', { rideId });
    console.log('🚗 Joined ride:', rideId);
  }

  // Leave ride room
  leaveRide(rideId: string) {
    if (!this.socket) return;
    
    this.socket.emit('leave_ride', { rideId });
    console.log('🚗 Left ride:', rideId);
  }

  // Listen for ride joined confirmation
  onJoinedRide(callback: (data: { rideId: string; participants: string[] }) => void) {
    if (!this.socket) return;
    
    this.socket.on('joined_ride', callback);
  }

  // Remove ride joined listener
  offJoinedRide(callback?: (data: any) => void) {
    if (!this.socket) return;
    this.socket.off('joined_ride', callback);
  }

  // Send message
  sendMessage(conversationId: string, content: string, type: 'text' | 'image' | 'file' = 'text') {
    if (!this.socket || !this.userId) return;
    
    this.socket.emit('send_message', {
      userId: this.userId,
      conversationId,
      content,
      type,
    });
  }

  // Typing indicator
  sendTyping(conversationId: string, isTyping: boolean) {
    if (!this.socket || !this.userId) return;
    
    this.socket.emit('typing', {
      userId: this.userId,
      conversationId,
      isTyping,
    });
  }

  // Mark messages as read
  markAsRead(conversationId: string) {
    if (!this.socket || !this.userId) return;
    
    this.socket.emit('mark_read', {
      userId: this.userId,
      conversationId,
    });
  }

  // Listen for new messages
  onNewMessage(callback: (message: Message) => void) {
    if (!this.socket) return;
    
    this.socket.on('new_message', callback);
  }

  // Listen for message sent confirmation
  onMessageSent(callback: (data: any) => void) {
    if (!this.socket) return;
    
    this.socket.on('message_sent', callback);
  }

  // Listen for typing indicators
  onUserTyping(callback: (data: TypingIndicator) => void) {
    if (!this.socket) return;
    
    this.socket.on('user_typing', callback);
  }

  // Listen for read receipts
  onMarkedRead(callback: (data: { conversationId: string; userId: string }) => void) {
    if (!this.socket) return;
    
    this.socket.on('marked_read', callback);
  }

  // Remove listeners
  offNewMessage(callback?: (message: Message) => void) {
    if (!this.socket) return;
    this.socket.off('new_message', callback);
  }

  offUserTyping(callback?: (data: TypingIndicator) => void) {
    if (!this.socket) return;
    this.socket.off('user_typing', callback);
  }

  offMarkedRead(callback?: (data: any) => void) {
    if (!this.socket) return;
    this.socket.off('marked_read', callback);
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
export default socketService;
