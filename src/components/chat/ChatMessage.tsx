import { Card } from '@/components/ui/card';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} chat-message-enter`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      
      <Card className={`max-w-[80%] p-3 shadow-chat ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-card text-card-foreground border-border'
      }`}>
        <p className="text-sm font-poppins leading-relaxed whitespace-pre-wrap">
          {message}
        </p>
        {timestamp && (
          <p className={`text-xs mt-2 ${
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            {timestamp}
          </p>
        )}
      </Card>
    </div>
  );
};