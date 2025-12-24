'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/api';
import MessageList, { Message } from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import { ArrowLeft, User, Circle } from 'lucide-react';

interface Conversation {
  id: string;
  title?: string;
  participants: Array<{
    id: string;
    name: string;
    role: 'driver' | 'passenger';
  }>;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  rideId?: string;
}

interface ChatScreenProps {
  currentUserId: string;
  currentUserName: string;
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ currentUserId, currentUserName, onBack }) => {
  const { messages: socketMessages, isConnected, joinConversation, leaveConversation } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Update messages from socket
  useEffect(() => {
    if (selectedConversation && socketMessages.length > 0) {
      const conversationMessages = socketMessages.filter(
        (msg) => msg.conversationId === selectedConversation.id
      );
      if (conversationMessages.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = conversationMessages.filter((m) => !existingIds.has(m.id));
          return [...prev, ...newMessages];
        });
      }
    }
  }, [socketMessages, selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await apiClient.chat.getConversations();
      setConversations(data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // Use mock data for testing
      setConversations([
        {
          id: '1',
          title: 'Аялал - UB → Darkhan',
          participants: [
            { id: '1', name: 'Батаа', role: 'driver' },
            { id: '2', name: 'Дорж', role: 'passenger' },
          ],
          lastMessage: {
            content: 'Хэдэн цагт хөдлөх вэ?',
            createdAt: new Date().toISOString(),
          },
          unreadCount: 2,
          rideId: 'ride-1',
        },
        {
          id: '2',
          title: 'Аялал - UB → Erdenet',
          participants: [
            { id: '1', name: 'Батаа', role: 'passenger' },
            { id: '3', name: 'Сүхбат', role: 'driver' },
          ],
          lastMessage: {
            content: 'Хэн хэнтэй явах вэ?',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          unreadCount: 0,
          rideId: 'ride-2',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Join conversation room
    joinConversation(conversation.id);

    // Load messages
    try {
      const data = await apiClient.chat.getMessages(conversation.id, 50, 0);
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      // Use mock messages for testing
      setMessages([
        {
          id: 'm1',
          conversationId: conversation.id,
          senderId: conversation.participants.find((p) => p.id !== currentUserId)?.id || '2',
          senderName: conversation.participants.find((p) => p.id !== currentUserId)?.name || 'Дорж',
          content: 'Сайн уу! Хэдэн цагт хөдлөх вэ?',
          type: 'text',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          read: true,
        },
        {
          id: 'm2',
          conversationId: conversation.id,
          senderId: currentUserId,
          senderName: currentUserName,
          content: 'Маргааш 8 цагт хөдлөх болно',
          type: 'text',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          read: true,
        },
        {
          id: 'm3',
          conversationId: conversation.id,
          senderId: conversation.participants.find((p) => p.id !== currentUserId)?.id || '2',
          senderName: conversation.participants.find((p) => p.id !== currentUserId)?.name || 'Дорж',
          content: 'За тэгье. Хаанаас авч явах вэ?',
          type: 'text',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          read: false,
        },
      ]);
    }
  };

  const handleBackToList = () => {
    if (selectedConversation) {
      leaveConversation(selectedConversation.id);
    }
    setSelectedConversation(null);
    setMessages([]);
  };

  const handleMessageSent = () => {
    // Refresh conversation list to update last message
    loadConversations();
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.id !== currentUserId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-gray-500">Ачааллаж байна...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <button
          onClick={selectedConversation ? handleBackToList : onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">
          {selectedConversation
            ? selectedConversation.title || getOtherParticipant(selectedConversation)?.name || 'Чат'
            : 'Мессежүүд'}
        </h1>
        {isConnected && (
          <div className="ml-auto flex items-center gap-2">
            <Circle className="w-2 h-2 fill-green-500 text-green-500" />
            <span className="text-xs text-green-600">Холбогдсон</span>
          </div>
        )}
      </div>

      {/* Content */}
      {selectedConversation ? (
        // Chat view
        <div className="flex flex-col flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            conversationId={selectedConversation.id}
          />
          <MessageInput
            conversationId={selectedConversation.id}
            onMessageSent={handleMessageSent}
          />
        </div>
      ) : (
        // Conversation list
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Ярилцлага байхгүй байна</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                return (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conversation.title || otherParticipant?.name || 'Харилцагч'}
                          </h3>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {new Date(conversation.lastMessage.createdAt).toLocaleTimeString('mn-MN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage?.content || 'Мессеж байхгүй'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 bg-[#00AFF5] text-white text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>

                        {otherParticipant && (
                          <p className="text-xs text-gray-500 mt-1">
                            {otherParticipant.role === 'driver' ? '🚗 Жолооч' : '👤 Зорчигч'}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatScreen;
