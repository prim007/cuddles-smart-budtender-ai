import { Suspense, lazy, type ComponentType } from "react";
import { Toaster } from "@/components/ui/toaster";
import CuddlesWalker from "@/components/CuddlesWalker";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import UserNamePrompt from "@/components/UserNamePrompt";
import NdebeleBackground from "@/components/NdebeleBackground";
import StickyMobileSignupBar from "@/components/StickyMobileSignupBar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));

const STALE_CHUNK_RELOAD_KEY = "cuddles:stale-chunk-reload";

const isStaleChunkImportError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return /Importing a module script failed|Failed to fetch dynamically imported module|Loading chunk \d+ failed|Unable to preload CSS/i.test(message);
};

const lazyWithReload = <T extends ComponentType<any>>(load: () => Promise<{ default: T }>) =>
  lazy(async () => {
    try {
      const module = await load();
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(STALE_CHUNK_RELOAD_KEY);
      }
      return module;
    } catch (error) {
      if (typeof window !== "undefined" && isStaleChunkImportError(error)) {
        const alreadyRetried = window.sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY) === "true";
        if (!alreadyRetried) {
          window.sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, "true");
          window.location.reload();
          return new Promise<never>(() => {});
        }
      }
      throw error;
    }
  });

// Lazy load pages with heavy dependencies (recharts, etc.)
const InvestmentDeck = lazyWithReload(() => import("./pages/InvestmentDeck"));
const ScheduleDemo = lazyWithReload(() => import("./pages/ScheduleDemo"));
const Analytics = lazyWithReload(() => import("./pages/Analytics"));
const AnalyticsDashboard = lazyWithReload(() => import("./pages/AnalyticsDashboard"));
const ABDashboard = lazyWithReload(() => import("./pages/ABDashboard"));
const DemoRequests = lazyWithReload(() => import("./pages/DemoRequests"));
const ChatConversations = lazyWithReload(() => import("./pages/ChatConversations"));
const AgentTraces = lazyWithReload(() => import("./pages/AgentTraces"));
const PipelineHealth = lazyWithReload(() => import("./pages/PipelineHealth"));
const InternationalMarket = lazyWithReload(() => import("./pages/InternationalMarket"));
const PrivacyPolicy = lazyWithReload(() => import("./pages/PrivacyPolicy"));
const Licensing = lazyWithReload(() => import("./pages/Licensing"));
const Install = lazyWithReload(() => import("./pages/Install"));
const ConfirmNewsletter = lazyWithReload(() => import("./pages/ConfirmNewsletter"));
const Unsubscribe = lazyWithReload(() => import("./pages/Unsubscribe"));
const Trust = lazyWithReload(() => import("./pages/Trust"));
const DPA = lazyWithReload(() => import("./pages/DPA"));

// New Cuddles features
const StrainJournal = lazyWithReload(() => import("./pages/StrainJournal"));
const StrainReviews = lazyWithReload(() => import("./pages/StrainReviews"));
const StrainScanner = lazyWithReload(() => import("./pages/StrainScanner"));
// Blog
const Blog = lazyWithReload(() => import("./pages/Blog"));
const BlogPost = lazyWithReload(() => import("./pages/BlogPost"));
const ToleranceBreak = lazyWithReload(() => import("./pages/ToleranceBreak"));
const TBreakChallenge = lazyWithReload(() => import("./pages/TBreakChallenge"));
const SeedlingMonitor = lazyWithReload(() => import("./pages/SeedlingMonitor"));
const InternationalCannabisMap = lazyWithReload(() => import("./pages/InternationalCannabisMap"));
const CountryPage = lazyWithReload(() => import("./pages/CountryPage"));

// B2B
const DispensaryOnboarding = lazyWithReload(() => import("./pages/DispensaryOnboarding"));
const WhyCuddles = lazyWithReload(() => import("./pages/WhyCuddles"));
const SeeItInActionPage = lazyWithReload(() => import("./pages/SeeItInActionPage"));
const WhatIsCuddles = lazyWithReload(() => import("./pages/WhatIsCuddles"));
const Catalog = lazyWithReload(() => import("./pages/Catalog"));
const ManageStrains = lazyWithReload(() => import("./pages/ManageStrains"));
const TenantInsights = lazyWithReload(() => import("./pages/TenantInsights"));
const Shop = lazyWithReload(() => import("./pages/Shop"));
const Checkout = lazyWithReload(() => import("./pages/Checkout"));
const OrderTracking = lazyWithReload(() => import("./pages/OrderTracking"));
const Premium = lazyWithReload(() => import("./pages/Premium"));
const Membership = lazyWithReload(() => import("./pages/Membership"));
const AIBudtender = lazyWithReload(() => import("./pages/AIBudtender"));
const POSIntegrations = lazyWithReload(() => import("./pages/POSIntegrations"));
const ShopifyIntegration = lazyWithReload(() => import("./pages/ShopifyIntegration"));
const AIvsManualBudtending = lazyWithReload(() => import("./pages/AIvsManualBudtending"));
const AIBasketSize = lazyWithReload(() => import("./pages/AIBasketSize"));
const CannabisRetailAutomation = lazyWithReload(() => import("./pages/CannabisRetailAutomation"));
const RAGWhitepaper = lazyWithReload(() => import("./pages/RAGWhitepaper"));
const DispensaryWaitTimes = lazyWithReload(() => import("./pages/DispensaryWaitTimes"));
const ChatWithCuddles = lazyWithReload(() => import("./pages/ChatWithCuddles"));
const PersonalizedRecommendationsGuide = lazyWithReload(() => import("./pages/PersonalizedRecommendationsGuide"));

// SEO pages
const Strains = lazyWithReload(() => import("./pages/Strains"));
const Plants = lazyWithReload(() => import("./pages/Plants"));
const PlantDetail = lazyWithReload(() => import("./pages/PlantDetail"));
const StrainDetail = lazyWithReload(() => import("./pages/StrainDetail"));
const FeaturedStrains = lazyWithReload(() => import("./pages/FeaturedStrains"));
const CityDispensaryPage = lazyWithReload(() => import("./pages/CityDispensaryPage"));
const WidgetOutreach = lazyWithReload(() => import("./pages/WidgetOutreach"));
const EmailQueueStatus = lazyWithReload(() => import("./pages/EmailQueueStatus"));
const BrevoSync = lazyWithReload(() => import("./pages/BrevoSync"));
const DatabricksAnalytics = lazyWithReload(() => import("./pages/DatabricksAnalytics"));
const SnowflakeAnalytics = lazyWithReload(() => import("./pages/SnowflakeAnalytics"));
const Claim = lazyWithReload(() => import("./pages/Claim"));
const MenuPage = lazyWithReload(() => import("./pages/MenuPage"));

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
              <NdebeleBackground />
              <CuddlesWalker />
              <GoogleAnalytics />
              <MicrosoftClarity />
              <InstallFunnelTracker />
              <FeatureNav />
              <ExitIntentCartReminder />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/.lovable/oauth/consent" element={<Suspense fallback={<PageLoader />}><OAuthConsent /></Suspense>} />
                <Route path="/claim" element={<Suspense fallback={<PageLoader />}><Claim /></Suspense>} />
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
                <Route
                  path="/ab-dashboard"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Suspense fallback={<PageLoader />}><ABDashboard /></Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pipeline-health"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Suspense fallback={<PageLoader />}><PipelineHealth /></Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route path="/international-market" element={<Suspense fallback={<PageLoader />}><InternationalMarket /></Suspense>} />
                <Route path="/privacy-policy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
                <Route path="/licensing" element={<Suspense fallback={<PageLoader />}><Licensing /></Suspense>} />
                <Route path="/install" element={<Suspense fallback={<PageLoader />}><Install /></Suspense>} />
                <Route path="/newsletter/confirm" element={<Suspense fallback={<PageLoader />}><ConfirmNewsletter /></Suspense>} />
                <Route path="/unsubscribe" element={<Suspense fallback={<PageLoader />}><Unsubscribe /></Suspense>} />
                <Route path="/trust" element={<Suspense fallback={<PageLoader />}><Trust /></Suspense>} />
                <Route path="/legal/dpa" element={<Suspense fallback={<PageLoader />}><DPA /></Suspense>} />
                
                {/* Cuddles Features */}
                <Route path="/journal" element={<Suspense fallback={<PageLoader />}><StrainJournal /></Suspense>} />
                <Route path="/reviews" element={<Suspense fallback={<PageLoader />}><StrainReviews /></Suspense>} />
                <Route path="/scanner" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><StrainScanner /></Suspense></ProtectedRoute>} />
                <Route path="/t-break" element={<Suspense fallback={<PageLoader />}><ToleranceBreak /></Suspense>} />
                <Route path="/t-break-challenge" element={<Suspense fallback={<PageLoader />}><TBreakChallenge /></Suspense>} />
                <Route path="/grow" element={<Suspense fallback={<PageLoader />}><SeedlingMonitor /></Suspense>} />
                <Route path="/international-cannabis-map" element={<Suspense fallback={<PageLoader />}><InternationalCannabisMap /></Suspense>} />
                <Route path="/africa-cannabis-map" element={<Navigate to="/international-cannabis-map?region=Africa" replace />} />
                <Route path="/country/:country" element={<Suspense fallback={<PageLoader />}><CountryPage /></Suspense>} />
                
                
                {/* Blog */}
                <Route path="/blog" element={<Suspense fallback={<PageLoader />}><Blog /></Suspense>} />
                <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogPost /></Suspense>} />
                
                {/* B2B */}
                <Route path="/dispensary-onboarding" element={<Suspense fallback={<PageLoader />}><DispensaryOnboarding /></Suspense>} />
                <Route path="/why-cuddles" element={<Suspense fallback={<PageLoader />}><WhyCuddles /></Suspense>} />
                <Route path="/see-it-in-action" element={<Suspense fallback={<PageLoader />}><SeeItInActionPage /></Suspense>} />
                <Route path="/what-is-cuddles" element={<Suspense fallback={<PageLoader />}><WhatIsCuddles /></Suspense>} />
                <Route path="/catalog" element={<Suspense fallback={<PageLoader />}><Catalog /></Suspense>} />
                <Route path="/manage-strains" element={<Suspense fallback={<PageLoader />}><ManageStrains /></Suspense>} />
                <Route path="/insights" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><TenantInsights /></Suspense></ProtectedRoute>} />
                <Route path="/shop" element={<Suspense fallback={<PageLoader />}><Shop /></Suspense>} />
                <Route path="/checkout" element={<Suspense fallback={<PageLoader />}><Checkout /></Suspense>} />
                <Route path="/orders/:orderId" element={<Suspense fallback={<PageLoader />}><OrderTracking /></Suspense>} />
                <Route path="/membership" element={<Suspense fallback={<PageLoader />}><Membership /></Suspense>} />
                <Route path="/premium" element={<Suspense fallback={<PageLoader />}><Premium /></Suspense>} />

                {/* Strain SEO Pages */}
                <Route path="/strains" element={<Suspense fallback={<PageLoader />}><Strains /></Suspense>} />
                <Route path="/strains/featured" element={<Suspense fallback={<PageLoader />}><FeaturedStrains /></Suspense>} />
                <Route path="/strains/:slug" element={<Suspense fallback={<PageLoader />}><StrainDetail /></Suspense>} />

                {/* Plant Care Directory */}
                <Route path="/plants" element={<Suspense fallback={<PageLoader />}><Plants /></Suspense>} />
                <Route path="/plants/:slug" element={<Suspense fallback={<PageLoader />}><PlantDetail /></Suspense>} />
                <Route path="/dispensary-near-me/:city" element={<Suspense fallback={<PageLoader />}><CityDispensaryPage /></Suspense>} />
                <Route
                  path="/admin/widget-outreach"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Suspense fallback={<PageLoader />}><WidgetOutreach /></Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/email-queue"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Suspense fallback={<PageLoader />}><EmailQueueStatus /></Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/brevo"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Suspense fallback={<PageLoader />}><BrevoSync /></Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/databricks"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Suspense fallback={<PageLoader />}><DatabricksAnalytics /></Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/snowflake"
                  element={
                    <ProtectedRoute requireAdmin>
                      <Suspense fallback={<PageLoader />}><SnowflakeAnalytics /></Suspense>
                    </ProtectedRoute>
                  }
                />



                {/* B2B SEO Pages */}
                <Route path="/ai-budtender" element={<Suspense fallback={<PageLoader />}><AIBudtender /></Suspense>} />
                <Route path="/pos-integrations" element={<Suspense fallback={<PageLoader />}><POSIntegrations /></Suspense>} />
                <Route path="/shopify-integration" element={<Suspense fallback={<PageLoader />}><ShopifyIntegration /></Suspense>} />
                <Route path="/ai-vs-manual-budtending" element={<Suspense fallback={<PageLoader />}><AIvsManualBudtending /></Suspense>} />
                <Route path="/how-ai-budtender-increases-basket-size" element={<Suspense fallback={<PageLoader />}><AIBasketSize /></Suspense>} />
                <Route path="/cannabis-retail-automation" element={<Suspense fallback={<PageLoader />}><CannabisRetailAutomation /></Suspense>} />
                <Route path="/technology" element={<Suspense fallback={<PageLoader />}><RAGWhitepaper /></Suspense>} />
                <Route path="/reduce-dispensary-wait-times" element={<Suspense fallback={<PageLoader />}><DispensaryWaitTimes /></Suspense>} />
                <Route path="/education/chat-with-cuddles" element={<Suspense fallback={<PageLoader />}><ChatWithCuddles /></Suspense>} />
                <Route path="/guides/personalized-recommendations" element={<Suspense fallback={<PageLoader />}><PersonalizedRecommendationsGuide /></Suspense>} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="/dirty-vapes" element={<Suspense fallback={<PageLoader />}><MenuPage slug="dirty-vapes" /></Suspense>} />
                <Route path="/tripple-four" element={<Suspense fallback={<PageLoader />}><MenuPage slug="tripple-four" /></Suspense>} />
                <Route path="/tripple444" element={<Suspense fallback={<PageLoader />}><MenuPage slug="tripple444" /></Suspense>} />
                <Route path="/lef-labs" element={<Suspense fallback={<PageLoader />}><MenuPage slug="lef-labs" /></Suspense>} />
                <Route path="/leaf-labs" element={<Suspense fallback={<PageLoader />}><MenuPage slug="leaf-labs" /></Suspense>} />
                <Route path="/menu/:slug" element={<Suspense fallback={<PageLoader />}><MenuPage /></Suspense>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CookieConsentBanner />
              <UserNamePrompt />
              <StickyMobileSignupBar />
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
