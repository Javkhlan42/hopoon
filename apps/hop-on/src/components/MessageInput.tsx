'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/api';
import { Send } from 'lucide-react';

interface MessageInputProps {
  conversationId: string;
  onMessageSent?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId, onMessageSent }) => {
  const { sendMessage, sendTyping, isConnected } = useSocket();
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleTyping = (value: string) => {
    setContent(value);

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Send typing indicator
    if (isConnected) {
      sendTyping(conversationId, true);

      // Stop typing after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        sendTyping(conversationId, false);
      }, 2000);

      setTypingTimeout(timeout);
    }
  };

  const handleSend = async () => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    const messageContent = content.trim();
    setContent('');

    try {
      // Stop typing indicator
      if (isConnected) {
        sendTyping(conversationId, false);
      }

      if (isConnected) {
        // Send via WebSocket
        sendMessage(conversationId, messageContent);
      } else {
        // Fallback to REST API
        await apiClient.chat.sendMessage(conversationId, messageContent);
      }

      onMessageSent?.();
    } catch (error) {
      console.error('Failed to send message:', error);
      setContent(messageContent); // Restore content on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Мессеж бичих..."
          disabled={isSending}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00AFF5] focus:border-transparent disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className="p-2 bg-[#00AFF5] text-white rounded-full hover:bg-[#0099DD] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {!isConnected && (
        <p className="text-xs text-yellow-600 mt-2">
          ⚠️ Холболт тасарсан. Мессеж REST API ашиглан илгээгдэнэ.
        </p>
      )}
    </div>
  );
};

export default MessageInput;
