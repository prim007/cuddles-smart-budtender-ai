import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InvestmentDeck from "./pages/InvestmentDeck";
import ScheduleDemo from "./pages/ScheduleDemo";
import Analytics from "./pages/Analytics";
import DemoRequests from "./pages/DemoRequests";
import InternationalMarket from "./pages/InternationalMarket";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/investment-deck" element={<InvestmentDeck />} />
          <Route path="/schedule-demo" element={<ScheduleDemo />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/demo-requests" element={<DemoRequests />} />
          <Route path="/international-market" element={<InternationalMarket />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
