'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Car, User as UserIcon } from 'lucide-react';
import apiClient from '../../lib/api';

interface Conversation {
  id: string;
  rideId: string;
  ride?: {
    origin_address: string;
    destination_address: string;
  };
  participants: Array<{
    id: string;
    name: string;
    profile_photo?: string;
    role: 'driver' | 'passenger';
  }>;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.conversations.list();
      const data = response.data || response;

      // Extract conversations array from response
      const conversationsData = Array.isArray(data) ? data : [];
      setConversations(conversationsData);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.id !== user?.id);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Уншиж байна...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Мессежүүд</h1>
        </div>
      </header>

      {/* Conversations List */}
      <main className="max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Уншиж байна...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Мессеж байхгүй байна</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              const isDriver = otherUser?.role === 'driver';

              return (
                <button
                  key={conversation.id}
                  onClick={() => router.push(`/chat/${conversation.id}`)}
                  className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors text-left bg-white"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherUser?.profile_photo} />
                      <AvatarFallback className="bg-gray-200">
                        {otherUser?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        Аялал - {conversation.ride?.origin_address} →{' '}
                        {conversation.ride?.destination_address}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTime(conversation.lastMessage.createdAt)} PM
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage?.content || 'Мессеж байхгүй'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {isDriver ? (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Car className="w-3 h-3 text-red-500" />
                          <span>Жолооч</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <UserIcon className="w-3 h-3 text-blue-500" />
                          <span>Зорчигч</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unread Badge */}
                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
