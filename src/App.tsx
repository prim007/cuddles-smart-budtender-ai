import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import MicrosoftClarity from "@/components/MicrosoftClarity";
import InstallFunnelTracker from "@/components/InstallFunnelTracker";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { CartProvider } from "@/contexts/CartContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import FeatureNav from "@/components/FeatureNav";
import ExitIntentCartReminder from "@/components/ExitIntentCartReminder";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load pages with heavy dependencies (recharts, etc.)
const InvestmentDeck = lazy(() => import("./pages/InvestmentDeck"));
const ScheduleDemo = lazy(() => import("./pages/ScheduleDemo"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const DemoRequests = lazy(() => import("./pages/DemoRequests"));
const ChatConversations = lazy(() => import("./pages/ChatConversations"));
const AgentTraces = lazy(() => import("./pages/AgentTraces"));
const InternationalMarket = lazy(() => import("./pages/InternationalMarket"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Install = lazy(() => import("./pages/Install"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const ConfirmNewsletter = lazy(() => import("./pages/ConfirmNewsletter"));

// New Cuddles features
const StrainJournal = lazy(() => import("./pages/StrainJournal"));
const StrainScanner = lazy(() => import("./pages/StrainScanner"));
const StrainReviews = lazy(() => import("./pages/StrainReviews"));

// Blog
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ToleranceBreak = lazy(() => import("./pages/ToleranceBreak"));
const SeedlingMonitor = lazy(() => import("./pages/SeedlingMonitor"));

// B2B
const DispensaryOnboarding = lazy(() => import("./pages/DispensaryOnboarding"));
const WhyCuddles = lazy(() => import("./pages/WhyCuddles"));
const Catalog = lazy(() => import("./pages/Catalog"));
const ManageStrains = lazy(() => import("./pages/ManageStrains"));
const Shop = lazy(() => import("./pages/Shop"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const Premium = lazy(() => import("./pages/Premium"));
const AIBudtender = lazy(() => import("./pages/AIBudtender"));
const POSIntegrations = lazy(() => import("./pages/POSIntegrations"));
const AIvsManualBudtending = lazy(() => import("./pages/AIvsManualBudtending"));
const AIBasketSize = lazy(() => import("./pages/AIBasketSize"));
const CannabisRetailAutomation = lazy(() => import("./pages/CannabisRetailAutomation"));
const RAGWhitepaper = lazy(() => import("./pages/RAGWhitepaper"));
const DispensaryWaitTimes = lazy(() => import("./pages/DispensaryWaitTimes"));
const ChatWithCuddles = lazy(() => import("./pages/ChatWithCuddles"));

// SEO pages
const Strains = lazy(() => import("./pages/Strains"));
const StrainDetail = lazy(() => import("./pages/StrainDetail"));
const FeaturedStrains = lazy(() => import("./pages/FeaturedStrains"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <UserProfileProvider>
        <CartProvider>
        <AuthProvider>
          <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <GoogleAnalytics />
              <MicrosoftClarity />
              <InstallFunnelTracker />
              <FeatureNav />
              <ExitIntentCartReminder />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/investment-deck" element={<Suspense fallback={<PageLoader />}><InvestmentDeck /></Suspense>} />
                <Route path="/schedule-demo" element={<Suspense fallback={<PageLoader />}><ScheduleDemo /></Suspense>} />
                <Route path="/analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />
                <Route
                  path="/analytics-dashboard"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Suspense fallback={<PageLoader />}><AnalyticsDashboard /></Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/demo-requests"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Suspense fallback={<PageLoader />}><DemoRequests /></Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat-conversations"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Suspense fallback={<PageLoader />}><ChatConversations /></Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agent-traces"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Suspense fallback={<PageLoader />}><AgentTraces /></Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route path="/international-market" element={<Suspense fallback={<PageLoader />}><InternationalMarket /></Suspense>} />
                <Route path="/privacy-policy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
                <Route path="/install" element={<Suspense fallback={<PageLoader />}><Install /></Suspense>} />
                <Route path="/unsubscribe" element={<Suspense fallback={<PageLoader />}><Unsubscribe /></Suspense>} />
                
                {/* Cuddles Features */}
                <Route path="/journal" element={<Suspense fallback={<PageLoader />}><StrainJournal /></Suspense>} />
                <Route path="/scanner" element={<Suspense fallback={<PageLoader />}><StrainScanner /></Suspense>} />
                <Route path="/reviews" element={<Suspense fallback={<PageLoader />}><StrainReviews /></Suspense>} />
                <Route path="/t-break" element={<Suspense fallback={<PageLoader />}><ToleranceBreak /></Suspense>} />
                <Route path="/grow" element={<Suspense fallback={<PageLoader />}><SeedlingMonitor /></Suspense>} />
                
                {/* Blog */}
                <Route path="/blog" element={<Suspense fallback={<PageLoader />}><Blog /></Suspense>} />
                <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogPost /></Suspense>} />
                
                {/* B2B */}
                <Route path="/dispensary-onboarding" element={<Suspense fallback={<PageLoader />}><DispensaryOnboarding /></Suspense>} />
                <Route path="/why-cuddles" element={<Suspense fallback={<PageLoader />}><WhyCuddles /></Suspense>} />
                <Route path="/catalog" element={<Suspense fallback={<PageLoader />}><Catalog /></Suspense>} />
                <Route path="/manage-strains" element={<Suspense fallback={<PageLoader />}><ManageStrains /></Suspense>} />
                <Route path="/shop" element={<Suspense fallback={<PageLoader />}><Shop /></Suspense>} />
                <Route path="/checkout" element={<Suspense fallback={<PageLoader />}><Checkout /></Suspense>} />
                <Route path="/orders/:orderId" element={<Suspense fallback={<PageLoader />}><OrderTracking /></Suspense>} />
                <Route path="/premium" element={<Suspense fallback={<PageLoader />}><Premium /></Suspense>} />

                {/* Strain SEO Pages */}
                <Route path="/strains" element={<Suspense fallback={<PageLoader />}><Strains /></Suspense>} />
                <Route path="/strains/featured" element={<Suspense fallback={<PageLoader />}><FeaturedStrains /></Suspense>} />
                <Route path="/strains/:slug" element={<Suspense fallback={<PageLoader />}><StrainDetail /></Suspense>} />

                {/* B2B SEO Pages */}
                <Route path="/ai-budtender" element={<Suspense fallback={<PageLoader />}><AIBudtender /></Suspense>} />
                <Route path="/pos-integrations" element={<Suspense fallback={<PageLoader />}><POSIntegrations /></Suspense>} />
                <Route path="/ai-vs-manual-budtending" element={<Suspense fallback={<PageLoader />}><AIvsManualBudtending /></Suspense>} />
                <Route path="/how-ai-budtender-increases-basket-size" element={<Suspense fallback={<PageLoader />}><AIBasketSize /></Suspense>} />
                <Route path="/cannabis-retail-automation" element={<Suspense fallback={<PageLoader />}><CannabisRetailAutomation /></Suspense>} />
                <Route path="/technology" element={<Suspense fallback={<PageLoader />}><RAGWhitepaper /></Suspense>} />
                <Route path="/reduce-dispensary-wait-times" element={<Suspense fallback={<PageLoader />}><DispensaryWaitTimes /></Suspense>} />
                <Route path="/education/chat-with-cuddles" element={<Suspense fallback={<PageLoader />}><ChatWithCuddles /></Suspense>} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CookieConsentBanner />
            </BrowserRouter>
          </TooltipProvider>
          </SubscriptionProvider>
        </AuthProvider>
        </CartProvider>
      </UserProfileProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
