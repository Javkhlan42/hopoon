'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import apiClient from '../../../lib/api';
import { useDialog } from '../../../components/DialogProvider';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender?: {
    id: string;
    name: string;
    profile_photo?: string;
  };
}

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
}

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const { showAlert } = useDialog();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && conversationId) {
      fetchConversation();
      fetchMessages();
    }
  }, [user, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const response = await apiClient.conversations.getById(conversationId);
      const data = response.data || response;
      setConversation(data);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response =
        await apiClient.messages.getByConversation(conversationId);
      const data = response.data || response;
      const messagesData = Array.isArray(data) ? data : [];
      setMessages(messagesData);

      // Mark messages as read
      const unreadMessageIds = messagesData
        .filter((msg: Message) => !msg.isRead && msg.senderId !== user?.id)
        .map((msg: Message) => msg.id);

      if (unreadMessageIds.length > 0) {
        await apiClient.messages.markAsRead({
          conversationId,
          messageIds: unreadMessageIds,
        });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await apiClient.messages.send({
        conversationId,
        content: newMessage.trim(),
      });

      const sentMessage = response.data || response;
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      showAlert('Мэссеж илгээхэд алдаа гарлаа');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getOtherParticipant = () => {
    return conversation?.participants.find((p) => p.id !== user?.id);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Уншиж байна...</div>
      </div>
    );
  }

  const otherUser = getOtherParticipant();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser?.profile_photo} />
            <AvatarFallback className="bg-gray-200">
              {otherUser?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="font-semibold">{otherUser?.name || 'Хэрэглэгч'}</h1>
            {conversation?.ride && (
              <p className="text-xs text-gray-500">
                {conversation.ride.origin_address} →{' '}
                {conversation.ride.destination_address}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Уншиж байна...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Мессеж байхгүй байна</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => {
              const isOwn = message.senderId === user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {!isOwn && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage
                          src={
                            message.sender?.profile_photo ||
                            otherUser?.profile_photo
                          }
                        />
                        <AvatarFallback className="bg-gray-200 text-xs">
                          {(message.sender?.name || otherUser?.name)?.charAt(
                            0,
                          ) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="flex flex-col">
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-cyan-500 text-white rounded-br-none'
                            : 'bg-white text-gray-900 rounded-bl-none border'
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                      </div>
                      <span
                        className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}
                      >
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Message Input */}
      <footer className="bg-white border-t sticky bottom-0 px-4 py-3">
        <form
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto flex gap-2"
        >
          <Input
            type="text"
            placeholder="Мессеж бичих..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            disabled={sending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-cyan-500 hover:bg-cyan-600 px-4"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
