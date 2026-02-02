import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import InvestmentDeck from "./pages/InvestmentDeck";
import ScheduleDemo from "./pages/ScheduleDemo";
import Analytics from "./pages/Analytics";
import DemoRequests from "./pages/DemoRequests";
import ChatConversations from "./pages/ChatConversations";
import InternationalMarket from "./pages/InternationalMarket";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Install from "./pages/Install";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GoogleAnalytics />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/investment-deck" element={<InvestmentDeck />} />
            <Route path="/schedule-demo" element={<ScheduleDemo />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route
              path="/demo-requests"
              element={
                <ProtectedRoute requireAdmin>
                  <DemoRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat-conversations"
              element={
                <ProtectedRoute requireAdmin>
                  <ChatConversations />
                </ProtectedRoute>
              }
            />
            <Route path="/international-market" element={<InternationalMarket />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/install" element={<Install />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
