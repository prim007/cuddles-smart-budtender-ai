import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import FeatureNav from "@/components/FeatureNav";
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
const InternationalMarket = lazy(() => import("./pages/InternationalMarket"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Install = lazy(() => import("./pages/Install"));

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

// SEO pages
const Strains = lazy(() => import("./pages/Strains"));
const StrainDetail = lazy(() => import("./pages/StrainDetail"));

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
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <GoogleAnalytics />
              <FeatureNav />
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
                <Route path="/international-market" element={<Suspense fallback={<PageLoader />}><InternationalMarket /></Suspense>} />
                <Route path="/privacy-policy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
                <Route path="/install" element={<Suspense fallback={<PageLoader />}><Install /></Suspense>} />
                
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

                {/* Strain SEO Pages */}
                <Route path="/strains" element={<Suspense fallback={<PageLoader />}><Strains /></Suspense>} />
                <Route path="/strains/:slug" element={<Suspense fallback={<PageLoader />}><StrainDetail /></Suspense>} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </UserProfileProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
