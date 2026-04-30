import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ChatSignupPrompt from "./ChatSignupPrompt";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/components/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, ExternalLink, Plus, Volume2, VolumeX, UserPlus } from "lucide-react";
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
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { trackChatInitiated, trackRecommendationGiven, trackOrderLinkClicked } from "@/components/GoogleAnalytics";
import ReactMarkdown from "react-markdown";
import ChatStrainCard from "./ChatStrainCard";

const generateSessionId = () => crypto.randomUUID();

interface Message {
  role: "user" | "assistant";
  content: string;
  orderPhone?: string;
}

const ChatDemo = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { profile, getProfileSummary } = useUserProfile();
  const { isSpeaking, isSupported: ttsSupported, speak, stop, speakIfGreeting } = useSpeechSynthesis();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
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

  const handleSend = async (messageContent?: string, fromVoice = false) => {
    const content = messageContent || input;
    if (!content.trim() || isLoading) return;
    const wasVoiceInput = fromVoice;

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setMessageCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 1) trackChatInitiated(sessionId);
      return newCount;
    });

    // Shadow-mode: fire-and-forget call to the recommendation agent.
    // User never sees this response — it logs to agent_traces for accuracy review.
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      supabase.functions.invoke("agent-recommend", {
        body: {
          user_message: content,
          user_id: s?.user?.id ?? null,
          session_id: sessionId,
        },
      }).catch((e) => console.debug("[shadow agent]", e));
    });

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smart-budtender`;
      
      // Use user's session token if logged in (enables Level 3/4 personalization)
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const authToken = currentSession?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
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
        trackOrderLinkClicked(`tel:${orderMatch[1]}`);
      }

      // Track if the AI gave a recommendation (heuristic: mentions strain-related keywords)
      if (/\b(recommend|try|suggest|strain|indica|sativa|hybrid)\b/i.test(finalContent)) {
        trackRecommendationGiven(sessionId);
      }

      // Final update with orderPhone if present
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: finalContent, orderPhone } : m);
        }
        return [...prev, { role: "assistant", content: finalContent, orderPhone }];
      });

      // Speak the response if voice is enabled and it's a greeting
      if (voiceEnabled && ttsSupported && finalContent) {
        const didGreet = speakIfGreeting(content, finalContent);
        // Also speak if the message was sent via voice input
        if (!didGreet && wasVoiceInput) {
          speak(finalContent);
        }
      }

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
    handleSend(transcript, true);
  };

  // Keep a stable ref to handleSend so the event listener never goes stale
  const handleSendRef = useRef(handleSend);
  useEffect(() => { handleSendRef.current = handleSend; });

  // Listen for hero quick-prompt events
  useEffect(() => {
    const handler = (e: Event) => {
      const prompt = (e as CustomEvent).detail;
      if (prompt) handleSendRef.current(prompt);
    };
    window.addEventListener('cuddles-quick-prompt', handler);
    return () => window.removeEventListener('cuddles-quick-prompt', handler);
  }, []);

  // Auto-send a welcome prompt after 3s if user hasn't interacted yet
  const autoPromptSent = useRef(false);
  useEffect(() => {
    if (autoPromptSent.current || messageCount > 0) return;
    const timer = setTimeout(() => {
      if (!autoPromptSent.current && messageCount === 0) {
        autoPromptSent.current = true;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "👋 **Hey! I'm here and ready.** Just type what you need:\n\n🛌 \"Help me sleep\"\n🎨 \"Something for creativity\"\n💆 \"Best for anxiety\"\n\nOr just say hi! 👇",
          },
        ]);
        trackEvent("auto_prompt_shown", "engagement", "chat_nudge");
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [messageCount]);

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
              {ttsSupported && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => { if (isSpeaking) stop(); setVoiceEnabled(!voiceEnabled); }}
                  className={`bg-card/80 backdrop-blur-sm border-border hover:bg-accent ${voiceEnabled ? 'text-primary' : 'text-muted-foreground'}`}
                  title={voiceEnabled ? "Mute Cuddles" : "Unmute Cuddles"}
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              )}
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
                  {message.role === "assistant" && index > 0 && (
                    <ChatStrainCard messageContent={message.content} />
                  )}
                  {message.orderPhone && (
                    <Button
                      className="mt-3 w-full bg-gradient-to-r from-hippie-coral to-hippie-amber hover:shadow-glow text-white font-display font-medium rounded-xl"
                      onClick={() => window.open('https://tripplefourshophub.online', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Shop Now at Tripple Four
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
            {/* Show signup prompt after 3 AI responses */}
            {messages.filter(m => m.role === "assistant").length >= 4 && (
              <ChatSignupPrompt />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Post-chat catalog nudge */}
          {messages.filter(m => m.role === "user").length >= 2 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
              <span className="text-2xl">🚀</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Ready to order?</p>
                <p className="text-xs text-muted-foreground">Get it delivered to your door</p>
              </div>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs"
                onClick={() => window.open('https://tripplefourshophub.online', '_blank')}
              >
                Shop Now
              </Button>
            </div>
          )}

          {/* Signup gate after 3 messages for unauthenticated users */}
          {!user && messageCount >= 3 ? (
            <div className="pt-4 border-t border-border">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/20">
                <p className="font-display font-bold text-foreground text-lg mb-1">
                  🔒 You've used your 3 free messages
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a free account to continue chatting, save your strains, and get personalized recommendations.
                </p>
                <Link
                  to="/auth"
                  onClick={() => trackEvent("cta_click", "signup", "chat_gate")}
                >
                  <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-2 font-semibold px-8 py-5 text-base rounded-xl w-full sm:w-auto">
                    <UserPlus className="w-5 h-5" /> Sign Up Free — It Takes 10 Seconds
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  Already have an account?{" "}
                  <Link to="/auth" className="text-primary underline hover:text-primary/80">Log in</Link>
                  {" · "}
                  <a href="https://tripplefourshophub.online" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Shop Now 🛒</a>
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Input */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={isLoading} className="h-10 w-10 min-w-[2.5rem]" />
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
            </>
          )}
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
