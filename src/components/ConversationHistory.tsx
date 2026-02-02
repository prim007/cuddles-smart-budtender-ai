import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { History, MessageSquare, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface SavedSession {
  sessionId: string;
  preview: string;
  timestamp: string;
  messageCount: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  redirectUrl?: string;
}

interface ConversationHistoryProps {
  onLoadSession: (sessionId: string, messages: Message[]) => void;
  currentSessionId: string;
}

const STORAGE_KEY = "cuddles-chat-history";

export const saveSession = (sessionId: string, messages: Message[]) => {
  if (messages.length <= 1) return; // Don't save if only welcome message
  
  const history = getHistory();
  const userMessages = messages.filter(m => m.role === "user");
  
  if (userMessages.length === 0) return;
  
  const session: SavedSession = {
    sessionId,
    preview: userMessages[0]?.content.slice(0, 50) + (userMessages[0]?.content.length > 50 ? "..." : ""),
    timestamp: new Date().toISOString(),
    messageCount: messages.length,
  };
  
  // Update or add session
  const existingIndex = history.findIndex(h => h.sessionId === sessionId);
  if (existingIndex >= 0) {
    history[existingIndex] = session;
  } else {
    history.unshift(session);
  }
  
  // Keep only last 20 sessions
  const trimmedHistory = history.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
  
  // Save full messages separately
  localStorage.setItem(`cuddles-session-${sessionId}`, JSON.stringify(messages));
};

export const getHistory = (): SavedSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const getSessionMessages = (sessionId: string): Message[] | null => {
  try {
    const stored = localStorage.getItem(`cuddles-session-${sessionId}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const ConversationHistory = ({ onLoadSession, currentSessionId }: ConversationHistoryProps) => {
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, [isOpen]);

  const handleLoadSession = (sessionId: string) => {
    const messages = getSessionMessages(sessionId);
    if (messages) {
      onLoadSession(sessionId, messages);
      setIsOpen(false);
    }
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.sessionId !== sessionId);
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    localStorage.removeItem(`cuddles-session-${sessionId}`);
  };

  const handleClearAll = () => {
    history.forEach(h => localStorage.removeItem(`cuddles-session-${h.sessionId}`));
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-card/80 backdrop-blur-sm border-border hover:bg-accent"
          aria-label="View conversation history"
        >
          <History className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <History className="h-5 w-5" />
            Conversation History
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-4">
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="mb-4 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all history
            </Button>
          )}
          
          <ScrollArea className="h-[calc(100vh-180px)]">
            {history.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved conversations yet</p>
                <p className="text-sm mt-2">Your chat history will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((session) => (
                  <div
                    key={session.sessionId}
                    onClick={() => handleLoadSession(session.sessionId)}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                      session.sessionId === currentSessionId
                        ? "bg-primary/10 border-primary"
                        : "bg-muted/50 border-transparent hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{session.preview}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{format(new Date(session.timestamp), "MMM d, h:mm a")}</span>
                          <span>•</span>
                          <span>{session.messageCount} messages</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDeleteSession(session.sessionId, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ConversationHistory;
