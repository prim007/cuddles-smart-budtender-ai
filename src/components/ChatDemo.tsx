import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Phone, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import cuddlesImage from "@/assets/cuddles.png";


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
  const processedImage = cuddlesImage;
  const [sessionId, setSessionId] = useState<string>(generateSessionId());
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smart-budtender`;
      
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
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
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }

      if (!resp.body) throw new Error("No response stream");

      // Stream SSE tokens
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const tokenContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (tokenContent) {
              assistantSoFar += tokenContent;
              const currentContent = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && !last.orderPhone) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: currentContent } : m);
                }
                return [...prev, { role: "assistant", content: currentContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const tokenContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (tokenContent) assistantSoFar += tokenContent;
          } catch { /* ignore */ }
        }
      }

      // Process order phone from complete response
      let finalContent = assistantSoFar || "";
      let orderPhone: string | undefined;
      const orderMatch = finalContent.match(/\[ORDER:([0-9]+)\]/);
      if (orderMatch) {
        orderPhone = orderMatch[1];
        finalContent = finalContent.replace(/\[ORDER:[^\]]+\]/, '').trim();
      }

      // Final update with orderPhone if present
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: finalContent, orderPhone } : m);
        }
        return [...prev, { role: "assistant", content: finalContent, orderPhone }];
      });

      // Save conversation
      try {
        await supabase.from('chat_conversations').insert({
          session_id: sessionId,
          user_message: userMessage.content,
          assistant_message: finalContent,
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
      const errorMsg = error.message || "Failed to get response. Please try again.";
      
      // Surface rate limit / payment errors clearly
      if (errorMsg.includes("429") || errorMsg.includes("rate limit") || errorMsg.includes("Too many")) {
        toast({ title: "Slow down", description: "Too many requests. Please wait a moment and try again.", variant: "destructive" });
      } else if (errorMsg.includes("402") || errorMsg.includes("Payment")) {
        toast({ title: "Service unavailable", description: "AI service temporarily unavailable. Please try again later.", variant: "destructive" });
      } else {
        toast({ title: t.error, description: errorMsg, variant: "destructive" });
      }
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
    handleSend(transcript);
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
                    <ReactMarkdown
                      disallowedElements={['script', 'iframe', 'object', 'embed', 'link', 'style']}
                      unwrapDisallowed
                    >{message.content}</ReactMarkdown>
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

          {/* Post-chat catalog nudge */}
          {messages.filter(m => m.role === "user").length >= 2 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(142,70%,45%)]/10 border border-[hsl(142,70%,45%)]/20 mb-4">
              <span className="text-2xl">🛒</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Ready to order?</p>
                <p className="text-xs text-muted-foreground">Browse our full product catalog on WhatsApp</p>
              </div>
              <Button
                size="sm"
                className="bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white rounded-lg text-xs"
                onClick={() => window.open("https://wa.me/c/27645436734", "_blank")}
              >
                Browse Catalog
              </Button>
            </div>
          )}

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
