import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/components/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, ExternalLink, Plus, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import cuddlesImage from "@/assets/cuddles.png";

import ConversationHistory, { saveSession } from "./ConversationHistory";
import VoiceInputButton from "./VoiceInputButton";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { trackChatInitiated, trackRecommendationGiven, trackOrderLinkClicked } from "@/components/GoogleAnalytics";
import ReactMarkdown from "react-markdown";
import ChatStrainCard from "./ChatStrainCard";
import ChatDispensaryCards, { type Dispensary } from "./ChatDispensaryCards";
import ChatMenuCard from "./ChatMenuCard";
import ChatUIFeedbackPrompt from "./ChatUIFeedbackPrompt";
import { matchMenuIntent, DISPENSARY_MENUS } from "@/data/dispensaryMenus";
import { isUiRoast } from "@/lib/uiRoast";

const generateSessionId = () => crypto.randomUUID();

interface Message {
  role: "user" | "assistant";
  content: string;
  orderPhone?: string;
  dispensaries?: Dispensary[];
  menuId?: string;
  uiFeedback?: boolean;
}

const DISPENSARY_INTENT_RE = /\b(dispensar(y|ies)|weed\s*shop|cannabis\s*(shop|store)|coffee\s*shop|head\s*shop|physical\s+(storefront|store|shop|location)|tripple\s*four.{0,40}(location|shop|store)|(?:nearest|closest|nearby|local|closer)\s+(shop|store|spot|location|dispensar(y|ies)|weed|cannabis)|(?:shop|store|spot|dispensar(y|ies))s?\s+(near|nearby|close|closest|around)|where\s+(is|are|can\s+i\s+(find|buy|get))\b.*(shop|store|dispensar(y|ies)|tripple\s*four|location|weed|cannabis)|(?:find|locate|show|get)\s+(me\s+)?(a\s+|the\s+)?(nearest|closest|nearby|local)?\s*(shop|store|dispensar(y|ies)|location|weed|cannabis)|front\s+door)\b/i;
const NEAR_ME_RE = /\b(near\s*me|nearby|close\s*by|around\s*me|my\s*area|my\s*location|closest|nearest|where\s+i\s+am|based\s+on\s+where\s+i)\b/i;
const BUY_INTENT_RE = /\b(for\s+sale|on\s+sale|who\s+sells?|where\s+(can|do)\s+i\s+(buy|score|cop|purchase)|want\s+to\s+(buy|get|score|cop|purchase)|looking\s+to\s+(buy|get|score|cop|purchase)|need\s+to\s+(buy|score|purchase)|buy\s+(some\s+)?(weed|bud|flower|cannabis|dagga|zol|grams?|edibles?|vapes?|pre-?rolls?)|score\s+(some\s+)?(weed|bud|dagga|zol)|price\s+of\s+(weed|cannabis|bud)|stock(ists?|ed)?\s+near)\b/i;
const LOOSE_FIND_RE = /\b(where\s+(can|do)\s+i\s+(find|get)|i?\s*need\s+to\s+find|trying\s+to\s+find)\b/i;
const COMMERCE_CONTEXT_RE = /\b(for\s+sale|buy|purchase|sells?|selling|stock(ists?|ed|ing)?|price|prices|cost|dispensar(y|ies)|shop|shops|store|stores|deliver(y|ed|ies)?|near\s*me|nearby|closest|nearest|in\s+stock|grams?|pre-?rolls?)\b/i;
const hasBuyIntent = (content: string) => BUY_INTENT_RE.test(content) || (LOOSE_FIND_RE.test(content) && COMMERCE_CONTEXT_RE.test(content));
const LOCATION_TROUBLE_RE = /\b(location|gps|map|maps|near\s*me|closest)\b.{0,40}\b(not\s+working|isn'?t\s+working|doesn'?t\s+work|broken|failed|unavailable|can'?t|cannot)\b|\b(not\s+working|broken|failed|unavailable)\b.{0,40}\b(location|gps|map|maps|near\s*me|closest)\b/i;
export type ChatIntent = "advice" | "recommendation" | "dispensary" | "purchase" | "menu" | "general" | "ui" | "other";
export function classifyIntent(content: string): ChatIntent {
  const lower = content.toLowerCase();
  if (isUiRoast(lower)) return "ui";
  if (matchMenuIntent(content)) return "menu";
  if (hasBuyIntent(content)) return "purchase";
  if (DISPENSARY_INTENT_RE.test(lower) || NEAR_ME_RE.test(lower) || LOCATION_TROUBLE_RE.test(lower)) return "dispensary";
  if (/\b(recommend|suggest|strain|best for|top strain|indica|sativa|hybrid|help me|for sleep|for pain|for anxiety|creativity|energy|stress)\b/.test(lower)) return "recommendation";
  if (/\b(dose|dosage|how much|safe|side effect|interaction|warning|health|medical)\b/.test(lower)) return "advice";
  if (lower.length < 10) return "general";
  return "other";
}
const LOCATION_IN_MSG_RE = /\b(?:in|near|around|by|at)\s+([A-Z][A-Za-z\s,]{2,60}?)(?:[.?!]|$)/;
const extractProduct = (content: string): string | null => {
  const patterns = [
    /\b(?:buy|get|find|score|cop|purchase|sells?|stock(?:s|ing)?)\s+(?:some\s+|any\s+|me\s+)?(?:the\s+)?([A-Za-z][A-Za-z0-9'\-\s]{2,30}?)(?=\s+(?:for\s+sale|near|nearby|around|in|at|close|today|please)\b|[.?!,]|$)/i,
    /\b([A-Za-z][A-Za-z0-9'\-\s]{2,30}?)\s+for\s+sale\b/i,
  ];
  const generic = /^(weed|bud|buds|flower|cannabis|dagga|zol|grams?|it|some|something|anything|stuff|product|products|edibles?|vapes?|relief|help|advice|info|information|tips?|a\s+strain|the\s+best|strains?)$/i;
  for (const re of patterns) {
    const m = content.match(re);
    const raw = m?.[1]?.trim().replace(/\s+/g, " ");
    if (raw && !generic.test(raw)) return raw;
  }
  return null;
};

async function getBrowserLocation(timeoutMs = 8000): Promise<{ lat: number; lng: number } | null> {
  if (!("geolocation" in navigator)) return null;
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => { clearTimeout(timer); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
      () => { clearTimeout(timer); resolve(null); },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 },
    );
  });
}

const ChatDemo = () => {
  const { user, displayName } = useAuth();
  const { t, language } = useLanguage();
  const { profile } = useUserProfile();
  const { isSpeaking, isSupported: ttsSupported, speak, stop, speakIfGreeting, prime } = useSpeechSynthesis();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const INITIAL_MESSAGE: Message = { role: "assistant", content: t.initialMessage };
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const processedImage = cuddlesImage;
  const [sessionId, setSessionId] = useState<string>(generateSessionId());
  const [messageCount, setMessageCount] = useState(0);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const awaitingDispensaryLocation = useRef(false);
  const pendingProduct = useRef<string | null>(null);

  useEffect(() => {
    setMessages((prev) => prev.length === 1 && prev[0].role === "assistant" ? [{ ...prev[0], content: t.initialMessage }] : prev);
  }, [t.initialMessage]);
  useEffect(() => { if (messages.length > 1) saveSession(sessionId, messages); }, [messages, sessionId]);
  const scrollToBottom = (smooth = true) => requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" }));
  useEffect(() => { scrollToBottom(!isLoading); }, [messages, isLoading]);
  const handleLoadSession = useCallback((loadedSessionId: string, loadedMessages: Message[]) => { setSessionId(loadedSessionId); setMessages(loadedMessages); setMessageCount(loadedMessages.filter((m) => m.role === "user").length); }, []);
  const handleNewChat = () => { setSessionId(generateSessionId()); setMessages([{ role: "assistant", content: t.initialMessage }]); setMessageCount(0); awaitingDispensaryLocation.current = false; pendingProduct.current = null; };

  const runDispensarySearch = async (args: { lat?: number; lng?: number; address?: string; product?: string }) => {
    const { product, ...searchArgs } = args;
    const searchLabel = product ? `${product} cannabis dispensary` : "cannabis dispensary";
    const locationLabel = args.address ?? (typeof args.lat === "number" && typeof args.lng === "number" ? `${args.lat},${args.lng}` : "South Africa");
    const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${searchLabel} near ${locationLabel}`)}`;
    try {
      let dispensaries: Dispensary[] = [];
      try { const { data: dagga } = await supabase.functions.invoke("daggaspot-dispensaries", { body: { ...searchArgs, limit: 5 } }); if (Array.isArray(dagga?.dispensaries)) dispensaries = dagga.dispensaries; } catch (e) { console.error("daggaspot lookup failed", e); }
      const { data: sessionData } = await supabase.auth.getSession();
      if (dispensaries.length === 0 && sessionData.session) { const { data, error } = await supabase.functions.invoke("find-dispensaries", { body: { ...searchArgs, query: searchLabel } }); if (error) throw error; if (data?.error) throw new Error(data.error); dispensaries = data?.dispensaries || []; }
      if (dispensaries.length === 0 && !sessionData.session) { setMessages((prev) => [...prev, { role: "assistant", content: `I found your location. [See ${product ? `${product} sellers` : "dispensaries"} near **${args.address ?? "you"}** on Google Maps](${mapsSearchUrl}). Sign in for Cuddles to rank the closest results here in chat. Stock changes daily, so call ahead to confirm. Not medical advice.`, ...(product ? { orderPhone: "0645436734" } : {}) }]); return; }
      trackEvent("dispensary_search", "engagement", args.address ? "address" : "gps");
      if (dispensaries.length === 0) { setMessages((prev) => [...prev, { role: "assistant", content: "I couldn't find any dispensaries nearby that location. Try a different city or a more specific area? 🌍" }]); return; }
      const nearestKm = dispensaries.map((d) => typeof d.distance_km === "number" ? d.distance_km : null).filter((d): d is number => d != null).sort((a, b) => a - b)[0];
      const farAway = nearestKm != null && nearestKm > 25;
      setMessages((prev) => [...prev, { role: "assistant", content: product ? `Here are the ${dispensaries.length} closest spots to ask for **${product}** 🌿 — stock changes daily, so call ahead to confirm they have it. You can also order delivery from Tripple Four below. Not medical advice.` : farAway ? `I couldn't find anything right on your doorstep — the nearest listings are about ${Math.round(nearestKm ?? 0)} km away 🌿 Call ahead before travelling.` : `Here are the top ${dispensaries.length} dispensaries closest to you 🌿`, dispensaries, ...(product ? { orderPhone: "0645436734" } : {}) }]);
    } catch (err) { console.error("dispensary search failed", err); setMessages((prev) => [...prev, { role: "assistant", content: `I couldn't load the ranked list, but you can still [search Google Maps for ${product ? `${product} sellers` : "dispensaries"} near **${args.address ?? "you"}**](${mapsSearchUrl}). Stock changes daily, so call ahead to confirm. Not medical advice.`, ...(product ? { orderPhone: "0645436734" } : {}) }]); }
  };

  const tryHandleDispensaryIntent = async (content: string): Promise<boolean> => {
    if (LOCATION_TROUBLE_RE.test(content)) { awaitingDispensaryLocation.current = true; setMessages((prev) => [...prev, { role: "assistant", content: "Location search needs browser permission. If the popup did not appear, enable location for this site, or type your **city or neighborhood** and I’ll search from there. You can still order delivery from Tripple Four below. Not medical advice.", orderPhone: "0645436734" }]); return true; }
    const isFollowUpCity = awaitingDispensaryLocation.current;
    const isExplicitIntent = DISPENSARY_INTENT_RE.test(content) || hasBuyIntent(content);
    if (!isExplicitIntent && !isFollowUpCity) return false;
    if (isFollowUpCity && !isExplicitIntent) { awaitingDispensaryLocation.current = false; const product = pendingProduct.current; pendingProduct.current = null; setIsLoading(true); try { await runDispensarySearch({ address: content.trim(), product: product ?? undefined }); } finally { setIsLoading(false); } return true; }
    const product = extractProduct(content); pendingProduct.current = product; setIsLoading(true);
    try {
      const addrMatch = content.match(LOCATION_IN_MSG_RE);
      if (addrMatch) { pendingProduct.current = null; await runDispensarySearch({ address: addrMatch[1].trim(), product: product ?? undefined }); return true; }
      const loc = await getBrowserLocation();
      if (loc) { pendingProduct.current = null; await runDispensarySearch({ lat: loc.lat, lng: loc.lng, product: product ?? undefined }); return true; }
      awaitingDispensaryLocation.current = true;
      setMessages((prev) => [...prev, { role: "assistant", content: product ? `Let's track down **${product}** 🌿 I couldn't get your location automatically — what **city or neighborhood** are you in? (e.g. "Sea Point, Cape Town")` : "I'd love to find the closest dispensaries! I couldn't get your location automatically — what **city or neighborhood** are you in? (e.g. \"Sea Point, Cape Town\")" }]);
      return true;
    } finally { setIsLoading(false); }
  };

  const handleSend = async (messageContent?: string, fromVoice = false) => {
    const content = messageContent || input;
    if (!content.trim() || isLoading) return;
    const wasVoiceInput = fromVoice;
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]); setInput("");
    if (isUiRoast(content)) { setMessageCount((prev) => prev + 1); setMessages((prev) => [...prev, { role: "assistant", content: "Okay okay, I hear you on the look and feel 😄 — you're the one using it, so tell me what you'd change and I'll pass it on.", uiFeedback: true }]); trackEvent("ui_feedback_prompt_shown", "engagement", "chat"); return; }
    const menu = matchMenuIntent(content);
    if (menu) { setMessageCount((prev) => prev + 1); setMessages((prev) => [...prev, { role: "assistant", content: "", menuId: menu.id }]); trackEvent("menu_shown", "engagement", menu.id); return; }
    const handled = await tryHandleDispensaryIntent(content);
    if (handled) { setMessageCount((prev) => prev + 1); return; }
    setIsLoading(true);
    setMessageCount((prev) => { const newCount = prev + 1; if (newCount === 1) trackChatInitiated(sessionId); try { sessionStorage.setItem("cuddles_chat_message_sent", "1"); } catch { /* noop */ } return newCount; });
    supabase.auth.getSession().then(({ data: { session: s } }) => { if (!s?.access_token) return; supabase.functions.invoke("agent-recommend", { body: { user_message: content, user_id: s.user?.id ?? null, session_id: sessionId } }).catch((e) => console.debug("[shadow agent]", e)); });
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smart-budtender`;
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const authToken = currentSession?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const resp = await fetch(CHAT_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ messages: [...messages, userMessage], sessionId, userProfile: { experienceLevel: profile.experienceLevel, toleranceLevel: profile.toleranceLevel, consumptionMethod: profile.consumptionMethod, preferredEffects: profile.preferredEffects, flavorPreferences: profile.flavorPreferences }, language, userName: displayName ?? undefined }) });
      if (!resp.ok) { const errData = await resp.json().catch(() => ({})); throw new Error(errData.error || `Request failed (${resp.status})`); }
      if (!resp.body) throw new Error("No response stream");
      const reader = resp.body.getReader(); const decoder = new TextDecoder(); let textBuffer = ""; let assistantSoFar = ""; let streamDone = false;
      while (!streamDone) { const { done, value } = await reader.read(); if (done) break; textBuffer += decoder.decode(value, { stream: true }); let newlineIndex: number; while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) { let line = textBuffer.slice(0, newlineIndex); textBuffer = textBuffer.slice(newlineIndex + 1); if (line.endsWith("\r")) line = line.slice(0, -1); if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) continue; const jsonStr = line.slice(6).trim(); if (jsonStr === "[DONE]") { streamDone = true; break; } try { const parsed = JSON.parse(jsonStr); const tokenContent = parsed.choices?.[0]?.delta?.content as string | undefined; if (tokenContent) { assistantSoFar += tokenContent; const currentContent = assistantSoFar; setMessages((prev) => { const last = prev[prev.length - 1]; if (last?.role === "assistant" && !last.orderPhone) return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: currentContent } : m); return [...prev, { role: "assistant", content: currentContent }]; }); } } catch { textBuffer = line + "\n" + textBuffer; break; } } }
      let finalContent = assistantSoFar; let orderPhone: string | undefined; const orderMatch = finalContent.match(/\[ORDER:([0-9]+)\]/); if (orderMatch) { orderPhone = orderMatch[1]; finalContent = finalContent.replace(/\[ORDER:[^\]]+\]/, "").trim(); trackOrderLinkClicked(`tel:${orderMatch[1]}`); }
      finalContent = finalContent.replace(/\*{2,}\s*—?\s*(This link will take you to\s*)?https?:\/\/tripplefourshophub\.online\/?/gi, "").replace(/\[\s*\]\(https?:\/\/tripplefourshophub\.online[^)]*\)/gi, "").replace(/(^|\s)\*{2,}(\s|$)/g, "$1$2").replace(/\n{3,}/g, "\n\n").trim();
      if (!orderPhone && /tripplefourshophub|shop now at tripple|nearest dispensary|shop near me/i.test(finalContent)) orderPhone = "0645436734";
      if (/\b(recommend|try|suggest|strain|indica|sativa|hybrid)\b/i.test(finalContent)) trackRecommendationGiven(sessionId);
      setMessages((prev) => { const last = prev[prev.length - 1]; if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: finalContent, orderPhone } : m); return [...prev, { role: "assistant", content: finalContent, orderPhone }]; });
      if (voiceEnabled && ttsSupported && finalContent) { const didGreet = speakIfGreeting(content, finalContent); if (!didGreet && wasVoiceInput) speak(finalContent); }
      try { await supabase.from("chat_conversations").insert({ session_id: sessionId, user_message: userMessage.content, assistant_message: finalContent, intent: classifyIntent(userMessage.content), redirect_url: orderPhone ? `tel:${orderPhone}` : null, user_metadata: { timestamp: new Date().toISOString(), language, is_test: false, user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, referrer: typeof document !== "undefined" ? document.referrer || null : null, path: typeof window !== "undefined" ? window.location.pathname : null, screen: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : null } }); } catch (dbError) { console.error("Error saving conversation:", dbError); }
    } catch (error: any) { console.error("Error:", error); const errorMsg = error?.message || ""; if (errorMsg.includes("429") || errorMsg.includes("rate limit") || errorMsg.includes("Too many")) toast({ title: "Slow down", description: "Too many requests. Please wait a moment and try again." }); else if (errorMsg.includes("402") || errorMsg.toLowerCase().includes("credits") || errorMsg.toLowerCase().includes("top up")) toast({ title: "Cuddles' AI credits are low", description: "The chat is temporarily unavailable. Please try again once service is restored." }); else toast({ title: "Chat temporarily unavailable", description: "Please try again in a little while." });
    } finally { setIsLoading(false); }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleVoiceTranscript = (transcript: string) => handleSend(transcript, true);
  const handleSendRef = useRef(handleSend); useEffect(() => { handleSendRef.current = handleSend; });
  useEffect(() => { const handler = (e: Event) => { const prompt = (e as CustomEvent).detail; if (prompt) handleSendRef.current(prompt); }; window.addEventListener("cuddles-quick-prompt", handler); return () => window.removeEventListener("cuddles-quick-prompt", handler); }, []);

  return (
    <section id="chat-demo" className="relative overflow-hidden bg-muted/30 py-16 md:py-24">
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-display font-bold text-foreground">{t.chatTitle}</h2>
          <p className="mt-3 text-lg text-muted-foreground">Ask a question and get a clear answer from Cuddles.</p>
        </div>
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-4 shadow-soft md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><ConversationHistory onLoadSession={handleLoadSession} currentSessionId={sessionId} /><Button variant="outline" size="icon" onClick={handleNewChat} aria-label={t.newChat}><Plus className="h-5 w-5" /></Button></div>
            <div className="flex items-center gap-2">
              {ttsSupported && <Button variant="outline" size="icon" onClick={() => { if (isSpeaking) stop(); const next = !voiceEnabled; setVoiceEnabled(next); if (next) prime(); }} aria-label={voiceEnabled ? "Mute Cuddles" : "Unmute Cuddles"}>{voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</Button>}
              <LanguageSelector />
              <span className="hidden text-sm text-muted-foreground sm:inline">{messages.filter((m) => m.role === "user").length} {t.messages}</span>
            </div>
          </div>
          <div className="mb-4 h-[400px] space-y-4 overflow-y-auto pr-2">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-soft ${message.role === "user" ? "bg-primary" : "bg-accent"}`}>{message.role === "user" ? <User className="h-5 w-5 text-primary-foreground" /> : <img src={processedImage} alt="Cuddles" className="h-full w-full object-cover" />}</div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground"}`}>
                  {message.content && <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown disallowedElements={["script", "iframe", "object", "embed", "link", "style"]} unwrapDisallowed>{message.content}</ReactMarkdown></div>}
                  {message.role === "assistant" && index > 0 && message.content && <ChatStrainCard messageContent={message.content} />}
                  {message.dispensaries && <ChatDispensaryCards dispensaries={message.dispensaries} />}
                  {message.menuId && (() => { const m = DISPENSARY_MENUS.find((x) => x.id === message.menuId); return m ? <ChatMenuCard menu={m} /> : null; })()}
                  {message.uiFeedback && <ChatUIFeedbackPrompt />}
                  {message.orderPhone && <Button className="mt-3 w-full" onClick={() => window.open("https://tripplefourshophub.online", "_blank")}><ExternalLink className="mr-2 h-4 w-4" />Shop Now at Tripple Four</Button>}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && <div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent"><img src={processedImage} alt="Cuddles" className="h-full w-full object-cover" /></div><div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">Cuddles is thinking…</div></div>}
            {showFeedbackPrompt && <div className="border-t border-border pt-3"><p className="text-sm font-semibold text-foreground">Is Cuddles helping you today?</p><div className="mt-2 flex gap-2"><Button size="sm" variant="outline" onClick={() => { trackEvent("chat_feedback", "engagement", "positive"); setShowFeedbackPrompt(false); }}>Yes, useful</Button><Button size="sm" variant="outline" onClick={() => { trackEvent("chat_feedback", "engagement", "negative"); setShowFeedbackPrompt(false); }}>Not really</Button></div></div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 border-t border-border pt-4">
            <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={isLoading} className="h-10 w-10 min-w-[2.5rem]" />
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder={t.chatPlaceholder} disabled={isLoading} className="flex-1" />
            <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()} aria-label="Send message"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatDemo;
