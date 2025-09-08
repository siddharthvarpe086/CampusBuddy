import { Card } from '@/components/ui/card';
import { User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} chat-message-enter`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 animate-pulse" />}
      </div>
      
      <Card className={`max-w-[80%] p-3 shadow-chat transition-all duration-300 hover:shadow-elevated ${
        isUser 
          ? 'gradient-primary text-primary-foreground hover:shadow-glow' 
          : 'bg-card text-card-foreground border-border hover:border-primary/20'
      }`}>
        {isUser ? (
          <p className="text-sm font-poppins leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        ) : (
          <div className="text-sm font-poppins leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                strong: ({ children }) => <strong className="font-bold text-inherit">{children}</strong>,
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        )}
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