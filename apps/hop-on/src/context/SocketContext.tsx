'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import socketService, { Message, TypingIndicator } from '@/lib/socket';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  typingUsers: Map<string, TypingIndicator>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  joinRide: (rideId: string) => void;
  leaveRide: (rideId: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  markAsRead: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
  userId?: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, userId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map());

  useEffect(() => {
    if (!userId) return;

    // Connect to socket
    const socketInstance = socketService.connect(userId);
    setSocket(socketInstance);

    // Update connection status
    const handleConnect = () => {
      setIsConnected(true);
      console.log('✅ Socket connected in context');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected in context');
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);

    // Listen for new messages
    socketService.onNewMessage((message: Message) => {
      console.log('📨 New message received:', message);
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing indicators
    socketService.onUserTyping((indicator: TypingIndicator) => {
      console.log('⌨️ User typing:', indicator);
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        if (indicator.isTyping) {
          updated.set(indicator.userId, indicator);
        } else {
          updated.delete(indicator.userId);
        }
        return updated;
      });

      // Auto-clear typing after 3 seconds
      if (indicator.isTyping) {
        setTimeout(() => {
          setTypingUsers((prev) => {
            const updated = new Map(prev);
            updated.delete(indicator.userId);
            return updated;
          });
        }, 3000);
      }
    });

    // Listen for read receipts
    socketService.onMarkedRead((data) => {
      console.log('✓✓ Messages marked as read:', data);
      // Update message read status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversationId === data.conversationId
            ? { ...msg, read: true }
            : msg
        )
      );
    });

    return () => {
      socketService.offNewMessage();
      socketService.offUserTyping();
      socketService.offMarkedRead();
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId]);

  const joinConversation = (conversationId: string) => {
    socketService.joinConversation(conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socketService.leaveConversation(conversationId);
  };

  const joinRide = (rideId: string) => {
    socketService.joinRide(rideId);
  };

  const leaveRide = (rideId: string) => {
    socketService.leaveRide(rideId);
  };

  const sendMessage = (conversationId: string, content: string) => {
    socketService.sendMessage(conversationId, content);
  };

  const sendTyping = (conversationId: string, isTyping: boolean) => {
    socketService.sendTyping(conversationId, isTyping);
  };

  const markAsRead = (conversationId: string) => {
    socketService.markAsRead(conversationId);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        messages,
        typingUsers,
        joinConversation,
        leaveConversation,
        joinRide,
        leaveRide,
        sendMessage,
        sendTyping,
        markAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
