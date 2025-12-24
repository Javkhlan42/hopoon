'use client';

import React, { useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Check, CheckCheck } from 'lucide-react';

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

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  conversationId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, conversationId }) => {
  const { typingUsers, markAsRead } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMarkedRead = useRef(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read when viewing messages
  useEffect(() => {
    if (messages.length > 0 && !hasMarkedRead.current) {
      const hasUnread = messages.some((msg) => !msg.read && msg.senderId !== currentUserId);
      if (hasUnread) {
        markAsRead(conversationId);
        hasMarkedRead.current = true;
      }
    }
  }, [messages, conversationId, currentUserId, markAsRead]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
  };

  const typingIndicators = Array.from(typingUsers.values()).filter(
    (indicator) => indicator.conversationId === conversationId && indicator.userId !== currentUserId
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Мессеж байхгүй байна</p>
        </div>
      ) : (
        <>
          {messages.map((message) => {
            const isSentByMe = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isSentByMe
                      ? 'bg-[#00AFF5] text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {!isSentByMe && message.senderName && (
                    <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                  )}
                  <p className="break-words">{message.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-75">{formatTime(message.createdAt)}</span>
                    {isSentByMe && (
                      <span className="text-xs">
                        {message.read ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicators */}
          {typingIndicators.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{typingIndicators[0].userName} бичиж байна</span>
                  <span className="flex gap-1">
                    <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;
