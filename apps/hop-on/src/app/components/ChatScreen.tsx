import React, { useState } from 'react';
import { Send, Phone, EllipsisVertical, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';


interface ChatScreenProps {
  onBack: () => void;
  recipientName: string;
  recipientPhoto: string;
}

const mockMessages = [
  {
    id: '1',
    sender: 'other',
    text: 'Hi! I saw you booked a seat for tomorrow morning.',
    time: '10:30 AM',
  },
  {
    id: '2',
    sender: 'me',
    text: 'Yes! Is the pickup location still at Sukhbaatar Square?',
    time: '10:32 AM',
  },
  {
    id: '3',
    sender: 'other',
    text: 'Exactly! I\'ll be there at 8:00 AM sharp. Look for a white Toyota.',
    time: '10:33 AM',
  },
  {
    id: '4',
    sender: 'me',
    text: 'Perfect! See you tomorrow. 👍',
    time: '10:35 AM',
  },
  {
    id: '5',
    sender: 'other',
    text: 'Great! Feel free to message if you need anything.',
    time: '10:36 AM',
  },
];

export function ChatScreen({ onBack, recipientName, recipientPhoto }: ChatScreenProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: String(messages.length + 1),
          sender: 'me',
          text: message,
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        },
      ]);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={recipientPhoto} alt={recipientName} />
              <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">{recipientName}</h2>
              <p className="text-sm text-gray-600">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <EllipsisVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {/* Date divider */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-200 rounded-full px-3 py-1 text-sm text-gray-600">
              Today
            </div>
          </div>

          {/* Messages list */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.sender === 'me'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border'
                }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-yellow-50 border-t border-yellow-200">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <p className="text-sm text-yellow-800 text-center">
            🔒 Never share personal contact information. Keep communication within the app.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <ImageIcon className="w-5 h-5 text-gray-600" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}