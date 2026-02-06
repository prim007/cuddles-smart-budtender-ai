import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Phone, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import cuddlesImage from "@/assets/cuddles.png";
import { processCuddlesImage } from "@/utils/processImage";

import QuickPrompts from "./QuickPrompts";
import ConversationHistory, { saveSession } from "./ConversationHistory";
import EmailCapture from "./EmailCapture";
import VoiceInputButton from "./VoiceInputButton";
import LanguageSelector from "./LanguageSelector";
import UserProfilePanel from "./UserProfilePanel";
import DosageCalculator from "./DosageCalculator";
import ImageUploadButton from "./ImageUploadButton";
import DispensaryFinder from "./DispensaryFinder";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import ReactMarkdown from "react-markdown";

const generateSessionId = () => crypto.randomUUID();

interface Message {
  role: "user" | "assistant";
  content: string;
  orderPhone?: string;
}

const ChatDemo = () => {
  const { t, language } = useLanguage();
  const { profile, getProfileSummary } = useUserProfile();
  
  const INITIAL_MESSAGE: Message = {
    role: "assistant",
    content: t.initialMessage,
  };

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
    // Defer heavy image processing to avoid blocking render and forced reflow
    const scheduleProcessing = () => {
      processCuddlesImage().then(setProcessedImage);
    };
    
    if ('requestIdleCallback' in window) {
      const idleId = requestIdleCallback(scheduleProcessing, { timeout: 2000 });
      return () => cancelIdleCallback(idleId);
    } else {
      const timeoutId = setTimeout(scheduleProcessing, 100);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  // Update initial message when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ ...prev[0], content: t.initialMessage }];
      }
      return prev;
    });
  }, [t.initialMessage]);

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
    // Use requestAnimationFrame to batch with next paint cycle and avoid forced reflow
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
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
    setMessages([{ role: "assistant", content: t.initialMessage }]);
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
        body: { 
          messages: [...messages, userMessage],
          sessionId,
          userProfile: {
            experienceLevel: profile.experienceLevel,
            toleranceLevel: profile.toleranceLevel,
            consumptionMethod: profile.consumptionMethod,
            preferredEffects: profile.preferredEffects,
            flavorPreferences: profile.flavorPreferences,
          },
          language,
        },
      });

      if (error) throw error;

      let responseContent = data.response;
      let orderPhone: string | undefined;
      
      const orderMatch = responseContent.match(/\[ORDER:([0-9]+)\]/);
      if (orderMatch) {
        orderPhone = orderMatch[1];
        responseContent = responseContent.replace(/\[ORDER:[^\]]+\]/, '').trim();
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
        orderPhone,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        // Minimize metadata collection - only store non-identifying operational data
        // Removed: userAgent (fingerprinting risk), profileSummary (potential PII)
        await supabase.from('chat_conversations').insert({
          session_id: sessionId,
          user_message: userMessage.content,
          assistant_message: responseContent,
          redirect_url: orderPhone ? `tel:${orderPhone}` : null,
          user_metadata: {
            timestamp: new Date().toISOString(),
            language,
          }
        });
      } catch (dbError) {
        console.error('Error saving conversation:', dbError);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: t.error,
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

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
  };

  return (
    <section id="demo" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-hippie-coral/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-hippie-lavender/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="pill mb-4 animate-fade-in">💬 Live Demo</div>
          <h2 className="font-display font-bold text-foreground mb-6">
            {t.chatTitle}
          </h2>
          <p className="text-lg text-muted-foreground">
            Experience the power of AI-driven recommendations in real-time
          </p>
        </div>

        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-6 md:p-8 animate-fade-in shadow-elevated">
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
                aria-label={t.newChat}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <ImageUploadButton onImageAnalysis={handleSend} disabled={isLoading} />
              <DispensaryFinder />
              <DosageCalculator />
              <UserProfilePanel />
              <LanguageSelector />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {messages.filter(m => m.role === "user").length} {t.messages}
              </span>
            </div>
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
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-soft ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-hippie-coral to-hippie-amber"
                      : "bg-gradient-to-br from-hippie-lavender to-hippie-teal"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-white" />
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
                      ? "bg-gradient-to-br from-hippie-coral to-hippie-peach text-white"
                      : "bg-card border border-border text-foreground shadow-soft"
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  {message.orderPhone && (
                    <Button
                      className="mt-3 w-full bg-gradient-to-r from-hippie-coral to-hippie-amber hover:shadow-glow text-white font-display font-medium rounded-xl"
                      onClick={() => window.open(`tel:${message.orderPhone}`, '_self')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Tripple444 to Order: {message.orderPhone}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-br from-hippie-lavender to-hippie-teal shadow-soft">
                  <img 
                    src={processedImage} 
                    alt="Cuddles" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-card border border-border shadow-soft">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-hippie-coral animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-hippie-peach animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <div className="w-2 h-2 rounded-full bg-hippie-amber animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={isLoading} />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.chatPlaceholder}
              disabled={isLoading}
              className="flex-1 rounded-xl border-border bg-background/50 focus-ring"
            />
            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="px-6 rounded-xl bg-gradient-to-r from-hippie-coral to-hippie-amber hover:shadow-glow text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Email capture inline */}
          <EmailCapture variant="inline" />
        </div>
      </div>

      {/* Floating email capture modal */}
      {showEmailCapture && (
        <EmailCapture variant="modal" onClose={handleDismissEmailCapture} />
      )}
    </section>
  );
};

export default ChatDemo;
