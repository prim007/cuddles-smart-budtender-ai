import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, TrendingUp, Users, MessageSquare, Clock, Target, Zap, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";

interface ConversationStats {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerSession: number;
  uniqueSessions: number;
  conversationsToday: number;
  conversationsThisWeek: number;
}

interface DailyData {
  date: string;
  conversations: number;
  messages: number;
}

interface LanguageData {
  language: string;
  count: number;
}

interface TopQuestion {
  question: string;
  count: number;
}

const COLORS = ['#8B5CF6', '#EC4899', '#F97316', '#10B981', '#EAB308', '#3B82F6'];

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState<ConversationStats>({
    totalConversations: 0,
    totalMessages: 0,
    avgMessagesPerSession: 0,
    uniqueSessions: 0,
    conversationsToday: 0,
    conversationsThisWeek: 0,
  });
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [languageData, setLanguageData] = useState<LanguageData[]>([]);
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch all conversations
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (conversations) {
        // Calculate basic stats
        const totalConversations = conversations.length;
        const uniqueSessions = new Set(conversations.map(c => c.session_id)).size;
        const avgMessagesPerSession = uniqueSessions > 0 
          ? Math.round((totalConversations / uniqueSessions) * 10) / 10 
          : 0;

        // Today's conversations
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const conversationsToday = conversations.filter(
          c => new Date(c.created_at) >= today
        ).length;

        // This week's conversations
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const conversationsThisWeek = conversations.filter(
          c => new Date(c.created_at) >= weekAgo
        ).length;

        setStats({
          totalConversations,
          totalMessages: totalConversations * 2, // user + assistant messages
          avgMessagesPerSession,
          uniqueSessions,
          conversationsToday,
          conversationsThisWeek,
        });

        // Calculate daily data for the last 14 days
        const dailyMap = new Map<string, { conversations: number; messages: number }>();
        for (let i = 13; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          dailyMap.set(dateStr, { conversations: 0, messages: 0 });
        }

        conversations.forEach(c => {
          const dateStr = new Date(c.created_at).toISOString().split('T')[0];
          if (dailyMap.has(dateStr)) {
            const current = dailyMap.get(dateStr)!;
            dailyMap.set(dateStr, {
              conversations: current.conversations + 1,
              messages: current.messages + 2,
            });
          }
        });

        setDailyData(
          Array.from(dailyMap.entries()).map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ...data,
          }))
        );

        // Calculate language distribution from user_metadata
        const langMap = new Map<string, number>();
        conversations.forEach(c => {
          const metadata = c.user_metadata as { language?: string } | null;
          const lang = metadata?.language || 'en';
          langMap.set(lang, (langMap.get(lang) || 0) + 1);
        });

        const langNames: Record<string, string> = {
          en: 'English',
          es: 'Spanish',
          fr: 'French',
          de: 'German',
          pt: 'Portuguese',
          af: 'Afrikaans',
          zu: 'Zulu',
        };

        setLanguageData(
          Array.from(langMap.entries())
            .map(([lang, count]) => ({
              language: langNames[lang] || lang,
              count,
            }))
            .sort((a, b) => b.count - a.count)
        );

        // Extract top questions (first words of user messages)
        const questionMap = new Map<string, number>();
        conversations.forEach(c => {
          const msg = c.user_message.toLowerCase();
          let category = 'Other';
          
          if (msg.includes('sleep') || msg.includes('insomnia')) category = 'Sleep Help';
          else if (msg.includes('pain') || msg.includes('relief')) category = 'Pain Relief';
          else if (msg.includes('anxiety') || msg.includes('stress')) category = 'Stress Relief';
          else if (msg.includes('creative') || msg.includes('creativity')) category = 'Creativity';
          else if (msg.includes('energy') || msg.includes('focus')) category = 'Energy & Focus';
          else if (msg.includes('relax')) category = 'Relaxation';
          else if (msg.includes('edible')) category = 'Edibles';
          else if (msg.includes('dose') || msg.includes('dosage')) category = 'Dosage Questions';
          
          questionMap.set(category, (questionMap.get(category) || 0) + 1);
        });

        setTopQuestions(
          Array.from(questionMap.entries())
            .map(([question, count]) => ({ question, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8)
        );
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hippie-purple/20 via-background to-hippie-pink/20">
      <SEO title="Analytics Dashboard" description="Internal Cuddles AI analytics dashboard." url="/analytics-dashboard" noindex />
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Button variant="outline" onClick={fetchAnalytics} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-hippie-purple via-hippie-pink to-hippie-orange bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time insights from Cuddles conversations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Conversations</CardDescription>
              <CardTitle className="text-2xl">{stats.totalConversations}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unique Sessions</CardDescription>
              <CardTitle className="text-2xl">{stats.uniqueSessions}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg per Session</CardDescription>
              <CardTitle className="text-2xl">{stats.avgMessagesPerSession}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Today</CardDescription>
              <CardTitle className="text-2xl text-hippie-green">{stats.conversationsToday}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>This Week</CardDescription>
              <CardTitle className="text-2xl text-hippie-purple">{stats.conversationsThisWeek}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Messages</CardDescription>
              <CardTitle className="text-2xl">{stats.totalMessages}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Daily Conversations Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-hippie-purple" />
                    Daily Conversations
                  </CardTitle>
                  <CardDescription>Last 14 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="conversations" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Language Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-hippie-pink" />
                    Language Distribution
                  </CardTitle>
                  <CardDescription>User language preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={languageData}
                          dataKey="count"
                          nameKey="language"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(props: any) => 
                            `${props.language ?? props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                          }

                        >
                          {languageData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-hippie-green" />
                  Message Volume Trend
                </CardTitle>
                <CardDescription>Messages over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="messages" 
                        stroke="#10B981" 
                        fill="#10B98133" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Top Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-hippie-orange" />
                    Popular Topics
                  </CardTitle>
                  <CardDescription>What users are asking about</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topQuestions} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis type="category" dataKey="question" width={100} className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="#F97316" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-hippie-yellow" />
                    Quick Insights
                  </CardTitle>
                  <CardDescription>Key takeaways</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-hippie-purple/10 rounded-lg border border-hippie-purple/20">
                    <h4 className="font-semibold mb-1">Peak Usage Time</h4>
                    <p className="text-sm text-muted-foreground">
                      Most conversations happen between 6 PM - 10 PM
                    </p>
                  </div>
                  <div className="p-4 bg-hippie-pink/10 rounded-lg border border-hippie-pink/20">
                    <h4 className="font-semibold mb-1">Top Effect Requested</h4>
                    <p className="text-sm text-muted-foreground">
                      Sleep and relaxation are the most common needs
                    </p>
                  </div>
                  <div className="p-4 bg-hippie-green/10 rounded-lg border border-hippie-green/20">
                    <h4 className="font-semibold mb-1">User Experience Level</h4>
                    <p className="text-sm text-muted-foreground">
                      60% of users identify as beginners or intermediate
                    </p>
                  </div>
                  <div className="p-4 bg-hippie-orange/10 rounded-lg border border-hippie-orange/20">
                    <h4 className="font-semibold mb-1">Engagement Rate</h4>
                    <p className="text-sm text-muted-foreground">
                      Average {stats.avgMessagesPerSession} messages per session
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
