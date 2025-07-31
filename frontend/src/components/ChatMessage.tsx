import React from 'react';
import MessageContent from './MessageContent';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
  showTimestamp?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, showTimestamp = true }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`message ${message.role}`}>
      <div className="message-bubble">
        <MessageContent content={message.content} />
      </div>
      {showTimestamp && (
        <div className="message-time">
          {formatTime(message.timestamp)}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;