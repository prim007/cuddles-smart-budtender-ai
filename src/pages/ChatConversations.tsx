import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, RefreshCw, Calendar, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: string;
  session_id: string;
  user_message: string;
  assistant_message: string;
  redirect_url: string | null;
  created_at: string;
  user_metadata: any;
}

interface ConversationGroup {
  session_id: string;
  messages: ChatMessage[];
  first_message_time: string;
  message_count: number;
}

const ChatConversations = () => {
  const [conversations, setConversations] = useState<ConversationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'created_at'>('created_at');
  const { toast } = useToast();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin privileges are required to view this page.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate, toast]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by session_id
      const grouped = (data || []).reduce((acc: Record<string, ChatMessage[]>, message) => {
        if (!acc[message.session_id]) {
          acc[message.session_id] = [];
        }
        acc[message.session_id].push(message);
        return acc;
      }, {});

      // Convert to array and sort
      const conversationGroups: ConversationGroup[] = Object.entries(grouped).map(([session_id, messages]) => ({
        session_id,
        messages: messages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
        first_message_time: messages[0].created_at,
        message_count: messages.length,
      })).sort((a, b) => 
        new Date(b.first_message_time).getTime() - new Date(a.first_message_time).getTime()
      );

      setConversations(conversationGroups);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error Loading Conversations",
        description: "Could not load chat conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [sortBy]);

  const getFirstUserQuestion = (messages: ChatMessage[]) => {
    return messages[0]?.user_message || "No messages";
  };

  const hasRedirect = (messages: ChatMessage[]) => {
    return messages.some(msg => msg.redirect_url);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Cuddles Chat History
              </h1>
              <p className="text-muted-foreground">
                View all customer conversations and interactions with Cuddles
              </p>
            </div>
            <Button onClick={fetchConversations} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          <div className="flex gap-4 items-center">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Button
              variant={sortBy === 'created_at' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('created_at')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Date
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-hippie-purple/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-hippie-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {conversations.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-hippie-green/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-hippie-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {conversations.reduce((sum, conv) => sum + conv.message_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-hippie-orange/20 rounded-lg">
                <Phone className="w-6 h-6 text-hippie-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {conversations.filter(conv => hasRedirect(conv.messages)).length}
                </p>
                <p className="text-sm text-muted-foreground">Led to Purchase Link</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Conversations Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>First Question</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Purchase Intent</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading conversations...
                    </div>
                  </TableCell>
                </TableRow>
              ) : conversations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No conversations yet</p>
                  </TableCell>
                </TableRow>
              ) : (
                conversations.map((conversation) => (
                  <TableRow key={conversation.session_id}>
                    <TableCell className="max-w-md">
                      <p className="truncate text-foreground">
                        {getFirstUserQuestion(conversation.messages)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {conversation.message_count} messages
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {hasRedirect(conversation.messages) ? (
                        <Badge className="bg-hippie-green/20 text-hippie-green border-hippie-green/50">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(conversation.first_message_time), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Full Chat
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Conversation Details</DialogTitle>
                            <DialogDescription>
                              {format(new Date(conversation.first_message_time), 'MMMM dd, yyyy at HH:mm')}
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="h-[500px] pr-4">
                            <div className="space-y-4">
                              {conversation.messages.map((message, idx) => (
                                <div key={message.id} className="space-y-3">
                                  {/* User Message */}
                                  <div className="flex justify-end">
                                    <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl max-w-[80%]">
                                      <p className="text-sm font-medium mb-1">User</p>
                                      <p className="whitespace-pre-wrap">{message.user_message}</p>
                                    </div>
                                  </div>
                                  
                                  {/* Assistant Message */}
                                  <div className="flex justify-start">
                                    <div className="bg-muted text-foreground px-4 py-3 rounded-2xl max-w-[80%]">
                                      <p className="text-sm font-medium mb-1 text-hippie-purple">Cuddles</p>
                                      <p className="whitespace-pre-wrap">{message.assistant_message}</p>
                                      {message.redirect_url && message.redirect_url.startsWith('tel:') && (
                                        <div className="mt-3 pt-3 border-t border-border">
                                          <a 
                                            href={message.redirect_url} 
                                            className="text-sm text-hippie-purple hover:underline flex items-center gap-1"
                                          >
                                            <Phone className="w-3 h-3" />
                                            Order Phone: {message.redirect_url.replace('tel:', '')}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default ChatConversations;
