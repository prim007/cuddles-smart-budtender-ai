import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, User, ExternalLink, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import cuddlesImage from "@/assets/cuddles.png";
import { processCuddlesImage } from "@/utils/processImage";
import QuickPrompts from "./QuickPrompts";
import ConversationHistory, { saveSession, getSessionMessages } from "./ConversationHistory";
import EmailCapture from "./EmailCapture";

const generateSessionId = () => crypto.randomUUID();

interface Message {
  role: "user" | "assistant";
  content: string;
  redirectUrl?: string;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Hi! I'm Cuddles. Tell me what effects you're looking for (like relaxation, creativity, or pain relief), your experience level, and any flavor preferences. I'll recommend the perfect products for you!",
};

const ChatDemo = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState<string>(cuddlesImage);
  const [sessionId, setSessionId] = useState<string>(generateSessionId());
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    processCuddlesImage().then(setProcessedImage);
  }, []);

  // Save session whenever messages change
  useEffect(() => {
    if (messages.length > 1) {
      saveSession(sessionId, messages);
    }
  }, [messages, sessionId]);

  // Show email capture after 3 messages
  useEffect(() => {
    if (messageCount >= 3 && !showEmailCapture) {
      const dismissed = localStorage.getItem("cuddles-email-dismissed");
      if (!dismissed) {
        setShowEmailCapture(true);
      }
    }
  }, [messageCount, showEmailCapture]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLoadSession = useCallback((loadedSessionId: string, loadedMessages: Message[]) => {
    setSessionId(loadedSessionId);
    setMessages(loadedMessages);
    setMessageCount(loadedMessages.filter(m => m.role === "user").length);
  }, []);

  const handleNewChat = () => {
    setSessionId(generateSessionId());
    setMessages([INITIAL_MESSAGE]);
    setMessageCount(0);
  };

  const handleSend = async (messageContent?: string) => {
    const content = messageContent || input;
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setMessageCount((prev) => prev + 1);

    try {
      const { data, error } = await supabase.functions.invoke("smart-budtender", {
        body: { messages: [...messages, userMessage] },
      });

      if (error) throw error;

      let responseContent = data.response;
      let redirectUrl: string | undefined;
      
      const redirectMatch = responseContent.match(/\[REDIRECT:(https?:\/\/[^\]]+)\]/);
      if (redirectMatch) {
        redirectUrl = redirectMatch[1];
        responseContent = responseContent.replace(/\[REDIRECT:[^\]]+\]/, '').trim();
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
        redirectUrl,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        await supabase.from('chat_conversations').insert({
          session_id: sessionId,
          user_message: userMessage.content,
          assistant_message: responseContent,
          redirect_url: redirectUrl || null,
          user_metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          }
        });
      } catch (dbError) {
        console.error('Error saving conversation:', dbError);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDismissEmailCapture = () => {
    setShowEmailCapture(false);
    localStorage.setItem("cuddles-email-dismissed", "true");
  };

  return (
    <section id="demo" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Try It Yourself
          </h2>
          <p className="text-xl text-muted-foreground">
            Experience the power of AI-driven recommendations in real-time
          </p>
        </div>

        <Card className="max-w-4xl mx-auto p-6 shadow-elevated bg-card">
          {/* Header with controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ConversationHistory 
                onLoadSession={handleLoadSession}
                currentSessionId={sessionId}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleNewChat}
                className="bg-card/80 backdrop-blur-sm border-border hover:bg-accent"
                aria-label="Start new chat"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              {messages.filter(m => m.role === "user").length} messages
            </span>
          </div>

          {/* Quick prompts */}
          <QuickPrompts onSelect={handleSend} disabled={isLoading} />

          {/* Messages */}
          <div className="h-[400px] overflow-y-auto mb-4 space-y-4 pr-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 animate-fade-in ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                    message.role === "user"
                      ? "bg-primary"
                      : "bg-gradient-to-br from-hippie-green to-hippie-yellow"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <img 
                      src={processedImage} 
                      alt="Cuddles" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.redirectUrl && (
                    <Button
                      className="mt-3 w-full bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange hover:shadow-glow text-white font-retro"
                      onClick={() => window.open(message.redirectUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Tripple4 to Purchase
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-br from-hippie-green to-hippie-yellow">
                  <img 
                    src={processedImage} 
                    alt="Cuddles" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-muted">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe what you're looking for..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Email capture inline */}
          <EmailCapture variant="inline" />
        </Card>
      </div>

      {/* Floating email capture modal */}
      {showEmailCapture && (
        <EmailCapture variant="modal" onClose={handleDismissEmailCapture} />
      )}
    </section>
  );
};

export default ChatDemo;
