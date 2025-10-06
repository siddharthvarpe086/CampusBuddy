import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Send, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import syncspotLogo from '@/assets/syncspot-logo.png';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export default function StudentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateBotResponse = async (userMessage: string): Promise<string | { redirectToSyncSpot: boolean }> => {
    try {
      // Call the AI chat edge function (Mistral primary, Gemini fallback)
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: userMessage }
      });

      if (error) {
        console.error('Error calling AI chat function:', error);
        return "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact the college administration directly for assistance.";
      }

      if (data?.response) {
        // Check if this was redirected to SyncSpot
        if (data?.redirect === 'syncspot') {
          return { redirectToSyncSpot: true };
        }
        return data.response;
      } else if (data?.error) {
        console.error('AI chat function error:', data.error);
        return "I'm sorry, I'm having trouble accessing my knowledge base right now. Please try again later or contact the college administration directly for assistance.";
      }

      return "I'm sorry, I didn't receive a proper response. Please try rephrasing your question or contact the college administration directly for assistance.";

    } catch (error) {
      console.error('Error processing request:', error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact the college administration directly for assistance.";
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Hide greeting after first message
    if (showGreeting) {
      setTimeout(() => setShowGreeting(false), 300);
    }

    // Generate AI response using Mistral (primary) with document data
    try {
      const botResponseResult = await generateBotResponse(text);
      
      // Check if question was redirected to SyncSpot (backend already posted it)
      if (typeof botResponseResult === 'object' && botResponseResult.redirectToSyncSpot) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I don't have information about this in my database. I've posted your question to **SyncSpot** where the community can help answer it!",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setTimeout(() => {
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
          
          // Show toast with link to SyncSpot
          toast({
            title: "✅ Posted to SyncSpot!",
            description: "Your question has been shared with the community.",
            action: (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/syncspot')}
              >
                View SyncSpot
              </Button>
            ),
          });
        }, 1500);
      } else {
        // Normal AI response from Mistral or Gemini
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponseResult as string,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setTimeout(() => {
          setMessages(prev => [...prev, botResponse]);
          setIsTyping(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "We will update soon.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, errorResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user || !profile) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col page-enter">
      <NavigationBar 
        title="Campus Buddy"
        showBack 
        onBack={() => navigate('/')}
      />
      
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full pb-20">
        {/* Fixed Greeting Message */}
        {showGreeting && (
          <div className={`mx-4 mt-4 mb-2 p-4 bg-accent/30 rounded-2xl border border-accent/20 transition-all duration-500 ${!showGreeting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <p className="text-sm text-foreground font-medium text-center">
              👋 Hey there! I'm your Campus Buddy. How can I help you today?
            </p>
          </div>
        )}
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <Card className="bg-card text-card-foreground border-border p-3 shadow-chat">
                <p className="text-sm text-muted-foreground font-poppins">
                  Campus Buddy is thinking...
                </p>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Bottom Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg z-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-center gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              className="flex-1 rounded-full bg-card border-border shadow-sm text-base px-5 py-3 h-12 focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={isTyping}
            />
            <button
              onClick={() => navigate('/syncspot')}
              className="w-12 h-12 bg-gradient-to-br from-[#3ABAFD] to-[#007BFF] hover:opacity-90 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md flex-shrink-0 p-2.5"
              title="Visit SyncSpot Community"
            >
              <img src={syncspotLogo} alt="SyncSpot" className="w-full h-full object-contain" />
            </button>
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
              className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90 shadow-md flex-shrink-0 transition-all duration-200 hover:scale-105"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
