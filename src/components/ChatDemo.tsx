import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ChatSignupPrompt from "./ChatSignupPrompt";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/components/GoogleAnalytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, ExternalLink, Plus, Volume2, VolumeX, UserPlus, Undo2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAnnouncer } from "@/contexts/AnnouncerContext";
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
import ChatDispensaryCards, { type Dispensary } from "./ChatDispensaryCards";
import ChatMenuCard from "./ChatMenuCard";
import ChatUIFeedbackPrompt from "./ChatUIFeedbackPrompt";
import { matchMenuIntent, DISPENSARY_MENUS } from "@/data/dispensaryMenus";
// UI / look-and-feel roast detection (tested in src/lib/uiRoast.test.ts)
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

// --- Dispensary intent detection ---
const DISPENSARY_INTENT_RE = /\b(dispensar(y|ies)|weed\s*shop|cannabis\s*(shop|store)|coffee\s*shop|head\s*shop|physical\s+(storefront|store|shop|location)|tripple\s*four.{0,40}(location|shop|store)|(?:nearest|closest|nearby|local|closer)\s+(shop|store|spot|location|dispensar(y|ies)|weed|cannabis)|(?:shop|store|spot|dispensar(y|ies))s?\s+(near|nearby|close|closest|around)|where\s+(is|are|can\s+i\s+(find|buy|get))\b.*(shop|store|dispensar(y|ies)|tripple\s*four|location|weed|cannabis)|(?:find|locate|show|get)\s+(me\s+)?(a\s+|the\s+)?(nearest|closest|nearby|local)?\s*(shop|store|dispensar(y|ies)|location|weed|cannabis)|front\s+door)\b/i;
const NEAR_ME_RE = /\b(near\s*me|nearby|close\s*by|around\s*me|my\s*area|my\s*location|closest|nearest|where\s+i\s+am|based\s+on\s+where\s+i)\b/i;
// Purchase intent: "where can I buy Durban Poison", "Durban Poison for sale", "I want to score some weed"
const BUY_INTENT_RE = /\b(for\s+sale|on\s+sale|who\s+sells?|where\s+(can|do)\s+i\s+(buy|score|cop|purchase)|want\s+to\s+(buy|get|score|cop|purchase)|looking\s+to\s+(buy|get|score|cop|purchase)|need\s+to\s+(buy|score|purchase)|buy\s+(some\s+)?(weed|bud|flower|cannabis|dagga|zol|grams?|edibles?|vapes?|pre-?rolls?)|score\s+(some\s+)?(weed|bud|dagga|zol)|price\s+of\s+(weed|cannabis|bud)|stock(ists?|ed)?\s+near)\b/i;
// Loose "find/get" phrasings only mean shopping when paired with real commerce context —
// otherwise "where can I find something for sleep" is just a budtender question.
const LOOSE_FIND_RE = /\b(where\s+(can|do)\s+i\s+(find|get)|i?\s*need\s+to\s+find|trying\s+to\s+find)\b/i;
const COMMERCE_CONTEXT_RE = /\b(for\s+sale|buy|purchase|sells?|selling|stock(ists?|ed|ing)?|price|prices|cost|dispensar(y|ies)|shop|shops|store|stores|deliver(y|ed|ies)?|near\s*me|nearby|closest|nearest|in\s+stock|grams?|pre-?rolls?)\b/i;
const hasBuyIntent = (content: string) =>
  BUY_INTENT_RE.test(content) || (LOOSE_FIND_RE.test(content) && COMMERCE_CONTEXT_RE.test(content));
const LOCATION_TROUBLE_RE = /\b(location|gps|map|maps|near\s*me|closest)\b.{0,40}\b(not\s+working|isn'?t\s+working|doesn'?t\s+work|broken|failed|unavailable|can'?t|cannot)\b|\b(not\s+working|broken|failed|unavailable)\b.{0,40}\b(location|gps|map|maps|near\s*me|closest)\b/i;

// --- Intent classification for analytics / funnel tagging ---
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

// Pull the product/strain the user is hunting for, e.g. "find Durban Poison for sale"
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
      (pos) => {
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 }
    );
  });
}

const ChatDemo = () => {
  const { user, displayName } = useAuth();
  const { t, language } = useLanguage();
  const { profile, getProfileSummary } = useUserProfile();
  const { isSpeaking, isSupported: ttsSupported, speak, stop, speakIfGreeting, prime } = useSpeechSynthesis();
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
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastSentRef = useRef<{ messages: Message[]; sessionId: string; messageCount: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const { guard, cue } = useAccessibility();
  const { announce, alert, streamChunk, endStream } = useAnnouncer();
  // When set, the next user message is treated as a city/address for dispensary lookup
  const awaitingDispensaryLocation = useRef(false);
  // Strain/product the user is hunting for, carried across the location follow-up
  const pendingProduct = useRef<string | null>(null);



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

  // Show email capture after 5 messages — only for logged-in users
  // (unauthenticated users see the signup gate at 3 msgs; avoid stacking CTAs)
  useEffect(() => {
    if (user && messageCount >= 5 && !showEmailCapture) {
      const dismissed = localStorage.getItem("cuddles-email-dismissed");
      if (!dismissed) {
        setShowEmailCapture(true);
      }
    }
  }, [messageCount, showEmailCapture, user]);

  const scrollToBottom = (smooth = true) => {
    // Scroll only the message list — never the page (which yanked mobile users
    // away from the hero on load).
    requestAnimationFrame(() => {
      const el = messagesContainerRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
  };

  useEffect(() => {
    // Use instant scroll while streaming to avoid jitter from token-by-token smooth scrolls
    scrollToBottom(!isLoading);
  }, [messages, isLoading]);


  const handleLoadSession = useCallback((loadedSessionId: string, loadedMessages: Message[]) => {
    setSessionId(loadedSessionId);
    setMessages(loadedMessages);
    setMessageCount(loadedMessages.filter(m => m.role === "user").length);
  }, []);

  const handleNewChat = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    endStream();
    setSessionId(generateSessionId());
    setMessages([{ role: "assistant", content: t.initialMessage }]);
    setMessageCount(0);
    awaitingDispensaryLocation.current = false;
    pendingProduct.current = null;
    lastSentRef.current = null;
    announce("New chat started");
  };

  // Run dispensary search and push results as an assistant message
  const runDispensarySearch = async (
    args: { lat?: number; lng?: number; address?: string; product?: string }
  ) => {
    const { product, ...searchArgs } = args;
    const searchLabel = product ? `${product} cannabis dispensary` : "cannabis dispensary";
    const locationLabel = args.address ?? (
      typeof args.lat === "number" && typeof args.lng === "number"
        ? `${args.lat},${args.lng}`
        : "South Africa"
    );
    const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${searchLabel} near ${locationLabel}`)}`;
    try {
      let dispensaries: Dispensary[] = [];

      // 1) DaggaSpot directory — free, works for signed-out visitors too
      try {
        const { data: dagga } = await supabase.functions.invoke("daggaspot-dispensaries", {
          body: { ...searchArgs, limit: 5 },
        });
        if (Array.isArray(dagga?.dispensaries)) dispensaries = dagga.dispensaries;
      } catch (e) {
        console.error("daggaspot lookup failed", e);
      }

      const { data: sessionData } = await supabase.auth.getSession();

      // 2) Fall back to Google Places for signed-in users when the directory is empty
      if (dispensaries.length === 0 && sessionData.session) {
        const { data, error } = await supabase.functions.invoke("find-dispensaries", {
          body: { ...searchArgs, query: searchLabel },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        dispensaries = data?.dispensaries || [];
      }

      if (dispensaries.length === 0 && !sessionData.session) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I found your location. [See ${product ? `${product} sellers` : "dispensaries"} near **${args.address ?? "you"}** on Google Maps](${mapsSearchUrl}). Sign in for Cuddles to rank the closest results here in chat. Stock changes daily, so call ahead to confirm. Not medical advice.`,
            ...(product ? { orderPhone: "0645436734" } : {}),
          },
        ]);
        return;
      }

      trackEvent("dispensary_search", "engagement", args.address ? "address" : "gps");

      if (dispensaries.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I couldn't find any dispensaries nearby that location. Try a different city or a more specific area? 🌍",
          },
        ]);
        return;
      }

      const nearestKm = dispensaries
        .map((d) => (typeof d.distance_km === "number" ? d.distance_km : null))
        .filter((d): d is number => d != null)
        .sort((a, b) => a - b)[0];
      const farAway = nearestKm != null && nearestKm > 25;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: product
            ? `Here are the ${dispensaries.length} closest spots to ask for **${product}** 🌿 — stock changes daily, so call ahead to confirm they have it. You can also order delivery from Tripple Four below. Not medical advice.`
            : farAway
              ? `I couldn't find anything right on your doorstep — the nearest listings are about ${Math.round(nearestKm!)} km away 🌿 Call ahead before travelling.`
              : `Here are the top ${dispensaries.length} dispensaries closest to you 🌿`,
          dispensaries,
          ...(product ? { orderPhone: "0645436734" } : {}),
        },
      ]);

    } catch (err: unknown) {
      console.error("dispensary search failed", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I couldn't load the ranked list, but you can still [search Google Maps for ${product ? `${product} sellers` : "dispensaries"} near **${args.address ?? "you"}**](${mapsSearchUrl}). Stock changes daily, so call ahead to confirm. Not medical advice.`,
          ...(product ? { orderPhone: "0645436734" } : {}),
        },
      ]);
    }
  };

  // Returns true if the message was handled as a dispensary intent and AI call should be skipped
  const tryHandleDispensaryIntent = async (content: string): Promise<boolean> => {
    if (LOCATION_TROUBLE_RE.test(content)) {
      awaitingDispensaryLocation.current = true;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Location search needs browser permission. If the popup did not appear, enable location for this site, or type your **city or neighborhood** and I’ll search from there. You can still order delivery from Tripple Four below. Not medical advice.",
          orderPhone: "0645436734",
        },
      ]);
      return true;
    }

    const isFollowUpCity = awaitingDispensaryLocation.current;
    const isExplicitIntent = DISPENSARY_INTENT_RE.test(content) || hasBuyIntent(content);
    if (!isExplicitIntent && !isFollowUpCity) return false;

    // Follow-up: treat whole message as the address
    if (isFollowUpCity && !isExplicitIntent) {
      awaitingDispensaryLocation.current = false;
      const product = pendingProduct.current;
      pendingProduct.current = null;
      setIsLoading(true);
      try {
        await runDispensarySearch({ address: content.trim(), product: product ?? undefined });
      } finally {
        setIsLoading(false);
      }
      return true;
    }

    const product = extractProduct(content);
    pendingProduct.current = product;

    setIsLoading(true);
    try {
      // 1) Address embedded in the message: "dispensaries in Cape Town"
      const addrMatch = content.match(LOCATION_IN_MSG_RE);
      if (addrMatch) {
        pendingProduct.current = null;
        await runDispensarySearch({ address: addrMatch[1].trim(), product: product ?? undefined });
        return true;
      }

      // 2) "Near me" or no location → try GPS
      const wantsGps = NEAR_ME_RE.test(content) || !addrMatch;
      if (wantsGps) {
        const loc = await getBrowserLocation();
        if (loc) {
          pendingProduct.current = null;
          await runDispensarySearch({ lat: loc.lat, lng: loc.lng, product: product ?? undefined });
          return true;
        }
        // GPS denied/unavailable → ask for city
        awaitingDispensaryLocation.current = true;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: product
              ? `Let's track down **${product}** for you 🌿 I couldn't get your location automatically — what **city or neighborhood** are you in? (e.g. "Sea Point, Cape Town")`
              : "I'd love to find the closest dispensaries! I couldn't get your location automatically — what **city or neighborhood** are you in? (e.g. \"Sea Point, Cape Town\")",
          },
        ]);
        return true;
      }

    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const handleSend = async (messageContent?: string, fromVoice = false) => {
    const content = messageContent || input;
    if (!content.trim() || isLoading) return;
    const wasVoiceInput = fromVoice;
    const previousMessages = messages;
    const previousMessageCount = messageCount;
    lastSentRef.current = { messages: previousMessages, sessionId };
    cue("send");
    announce("Message sent");

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    // UI roast / look-and-feel comment: ask them what they'd change instead of guessing.
    if (isUiRoast(content)) {
      setMessageCount((prev) => prev + 1);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Okay okay, I hear you on the look and feel 😄 — you're the one using it, so tell me what you'd change and I'll pass it on.",
          uiFeedback: true,
        },
      ]);
      trackEvent("ui_feedback_prompt_shown", "engagement", "chat");
      return;
    }


    // Menu intent: display the requested menu inline and bypass the AI completely.
    // This keeps live menu requests as a simple menu card, with no generated text.
    const menu = matchMenuIntent(content);
    if (menu) {
      setMessageCount((prev) => prev + 1);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          menuId: menu.id,
        },
      ]);
      trackEvent("menu_shown", "engagement", menu.id);
      return;
    }

    // Dispensary intent: handle locally with Google Places, skip the AI call
    const handled = await tryHandleDispensaryIntent(content);
    if (handled) {
      setMessageCount((prev) => prev + 1);
      return;
    }

    setIsLoading(true);
    setMessageCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 1) {
        trackChatInitiated(sessionId);
        import("@/lib/abTest").then(({ logAbEvent, CHAT_FAB_EXPERIMENT }) => {
          logAbEvent({ experiment: CHAT_FAB_EXPERIMENT, event: "chat_start", properties: { source: "input" } });
        });
      }
      try { sessionStorage.setItem("cuddles_chat_message_sent", "1"); } catch { /* noop */ }
      import("@/lib/abTest").then(({ logAbEvent, CHAT_FAB_EXPERIMENT }) => {
        logAbEvent({ experiment: CHAT_FAB_EXPERIMENT, event: "chat_message", properties: { count: newCount, source: wasVoiceInput ? "voice" : "text" } });
      });
      return newCount;
    });


    // Shadow-mode: fire-and-forget call to the recommendation agent.
    // Only runs for authenticated users (function requires JWT).
    // User never sees this response — it logs to agent_traces for accuracy review.
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s?.access_token) return; // anonymous users — skip, agent requires auth
      supabase.functions.invoke("agent-recommend", {
        body: {
          user_message: content,
          user_id: s.user?.id ?? null,
          session_id: sessionId,
        },
      }).catch((e) => console.debug("[shadow agent]", e));
    });

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smart-budtender`;
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
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
          userName: displayName ?? undefined,
        }),
        signal: abortController.signal,
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
               streamChunk(assistantSoFar);
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
      const finalMenu = matchMenuIntent(content);
      if (finalMenu) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          const menuMessage: Message = { role: "assistant", content: "", menuId: finalMenu.id };
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? menuMessage : m);
          }
          return [...prev, menuMessage];
        });
        trackEvent("menu_shown", "engagement", finalMenu.id);
        return;
      }
      let orderPhone: string | undefined;
      const orderMatch = finalContent.match(/\[ORDER:([0-9]+)\]/);
      if (orderMatch) {
        orderPhone = orderMatch[1];
        finalContent = finalContent.replace(/\[ORDER:[^\]]+\]/, '').trim();
        trackOrderLinkClicked(`tel:${orderMatch[1]}`);
      }
      // Strip malformed shop-link artifacts the model sometimes emits
      // (empty bold "****", empty markdown links "[](url)", bare hub URLs)
      finalContent = finalContent
        .replace(/\*{2,}\s*—?\s*(This link will take you to\s*)?https?:\/\/tripplefourshophub\.online\/?/gi, '')
        .replace(/\[\s*\]\(https?:\/\/tripplefourshophub\.online[^)]*\)/gi, '')
        .replace(/(^|\s)\*{2,}(\s|$)/g, '$1$2')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      // If the model talked about shopping/location but forgot the token, inject it
      if (!orderPhone && /tripplefourshophub|shop now at tripple|nearest dispensary|shop near me/i.test(finalContent)) {
        orderPhone = '0645436734';
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

      // Save conversation with enriched metadata (IP, UA, is_test flag)
      try {
        // Detect test mode: ?test=1 in URL sets localStorage flag permanently
        try {
          const params = new URLSearchParams(window.location.search);
          if (params.get('test') === '1') localStorage.setItem('cuddles_test_mode', '1');
          if (params.get('test') === '0') localStorage.removeItem('cuddles_test_mode');
        } catch {}
        const isTest = typeof window !== 'undefined' && localStorage.getItem('cuddles_test_mode') === '1';

        // Fetch client IP once per session (cached in sessionStorage)
        let ip: string | null = null;
        try {
          ip = sessionStorage.getItem('cuddles_client_ip');
          if (!ip) {
            const r = await fetch('https://api.ipify.org?format=json');
            if (r.ok) {
              ip = (await r.json())?.ip ?? null;
              if (ip) sessionStorage.setItem('cuddles_client_ip', ip);
            }
          }
        } catch { /* IP lookup is best-effort */ }

        await supabase.from('chat_conversations').insert({
          session_id: sessionId,
          user_message: userMessage.content,
          assistant_message: finalContent,
          intent: classifyIntent(userMessage.content),
          redirect_url: orderPhone ? `tel:${orderPhone}` : null,
          user_metadata: {
            timestamp: new Date().toISOString(),
            language,
            is_test: isTest,
            ip,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            referrer: typeof document !== 'undefined' ? document.referrer || null : null,
            path: typeof window !== 'undefined' ? window.location.pathname : null,
            screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : null,
          }
        });
      } catch (dbError) {
        console.error('Error saving conversation:', dbError);
      }

      // Show feedback prompt on every 5th assistant response, once per session
      if (!showFeedbackPrompt && (messageCount + 1) >= 5 && Math.random() < 0.3) {
        setShowFeedbackPrompt(true);
        trackEvent("chat_feedback_prompt_shown", "engagement", "session");
      }
    } catch (error: any) {
      console.error("Error:", error);
      const errorMsg = error?.message || "";

      // Never surface raw/technical errors to visitors — show a branded, actionable notice
      if (errorMsg.includes("429") || errorMsg.includes("rate limit") || errorMsg.includes("Too many")) {
        toast({ title: "Slow down", description: "Too many requests. Please wait a moment and try again." });
      } else if (errorMsg.includes("402") || errorMsg.toLowerCase().includes("credits") || errorMsg.toLowerCase().includes("top up")) {
        toast({
          title: "Cuddles' AI credits are low 🤖💳",
          description: "The workspace owner needs to top up Lovable AI credits to keep the chat going. Please try again once credits are restored.",
        });
      } else {
        toast({
          title: "Cuddles is under re-engineering 🛠️",
          description: "We're upgrading Cuddles right now — she'll be back soon. Please try again in a little while.",
        });
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
    <section id="demo" className="py-12 md:py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-hippie-coral/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-hippie-lavender/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
          <div className="pill mb-4 animate-fade-in">💬 Live Demo</div>
          <h2 className="font-display font-bold text-foreground mb-6">
            {t.chatTitle}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Experience the power of AI-driven recommendations in real-time
          </p>
        </div>

        <div className="max-w-4xl mx-auto glass-card rounded-2xl md:rounded-3xl p-3 sm:p-6 md:p-8 animate-fade-in shadow-elevated">
          {/* Header with controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
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
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {ttsSupported && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (isSpeaking) stop();
                    const next = !voiceEnabled;
                    setVoiceEnabled(next);
                    if (next) prime(); // unlock TTS inside gesture
                  }}
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
          <div ref={messagesContainerRef} className="h-[60vh] max-h-[400px] md:h-[400px] md:max-h-none overflow-y-auto mb-4 space-y-4 pr-1 md:pr-4">
            {(() => {
              const RECO_RE = /\b(recommend|try|suggest|strain|indica|sativa|hybrid|terpene|dose|dosage)\b/i;
              const firstRecoIdx = !user
                ? messages.findIndex((m, i) => i > 0 && m.role === "assistant" && RECO_RE.test(m.content))
                : -1;
              return messages.map((message, index) => (
                <div key={index}>
                  <div
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
                      {message.content && (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            disallowedElements={['script', 'iframe', 'object', 'embed', 'link', 'style']}
                            unwrapDisallowed
                          >{message.content}</ReactMarkdown>
                        </div>
                      )}
                      {message.role === "assistant" && index > 0 && message.content && (
                        <ChatStrainCard messageContent={message.content} />
                      )}
                      {message.dispensaries && (
                        <ChatDispensaryCards dispensaries={message.dispensaries} />
                      )}
                      {message.menuId && (() => {
                        const m = DISPENSARY_MENUS.find((x) => x.id === message.menuId);
                        return m ? <ChatMenuCard menu={m} /> : null;
                      })()}
                      {message.uiFeedback && <ChatUIFeedbackPrompt />}
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

                  {/* Contextual signup nudge after the first real recommendation (anonymous only) */}
                  {index === firstRecoIdx && messageCount < 3 && (
                    <div className="mt-3 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-3 animate-in fade-in">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <UserPlus className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground leading-tight">
                            Save this pick to your journal 🌿
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Free account — Cuddles remembers what worked for you.
                          </p>
                          <Link
                            to="/auth"
                            onClick={() => trackEvent("cta_click", "signup", "chat_contextual_reco")}
                          >
                            <Button
                              size="sm"
                              className="mt-2 h-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-1.5 text-xs"
                            >
                              <UserPlus className="h-3.5 w-3.5" /> Save & Sign Up Free
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ));
            })()}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
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
            {/* Show satisfaction feedback prompt after several exchanges */}
            {showFeedbackPrompt && (
              <div className="mt-3 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-3 animate-in fade-in">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-foreground">Is Cuddles helping you today?</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => {
                        trackEvent("chat_feedback", "engagement", "positive");
                        setShowFeedbackPrompt(false);
                      }}
                    >
                      👍 Yes, useful
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => {
                        trackEvent("chat_feedback", "engagement", "negative");
                        setShowFeedbackPrompt(false);
                        setMessages((prev) => [
                          ...prev,
                          { role: "assistant", content: "Got it — tell me what you're really looking for and I'll try a different angle. 🌿" },
                        ]);
                      }}
                    >
                      👎 Not really
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>


          {/* Post-chat catalog nudge */}
          {messages.filter(m => m.role === "user").length >= 2 && !(!user && messageCount >= 3) && (
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
                <p className="font-display font-bold text-foreground text-xl mb-2">
                  🎁 Unlock 20% off + your personalized strain report
                </p>
                <p className="text-sm text-foreground/80 mb-1">
                  Sign up free to keep chatting and instantly get:
                </p>
                <ul className="text-sm text-foreground/80 mb-4 space-y-1 inline-block text-left">
                  <li>✅ <strong>20% off</strong> your first Tripple Four Shop order</li>
                  <li>✅ Your <strong>personalized strain report</strong> (PDF) based on this chat</li>
                  <li>✅ Save strains, track sessions & unlimited Cuddles chat</li>
                </ul>
                <Link
                  to="/auth"
                  onClick={() => trackEvent("cta_click", "signup", "chat_gate")}
                >
                  <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-2 font-semibold px-8 py-5 text-base rounded-xl w-full sm:w-auto">
                    <UserPlus className="w-5 h-5" /> Claim My 20% Off — Sign Up Free
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
