import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PricingPage from "@/pages/pricing";
import AuthPage from "@/pages/auth-page";
import IdeasPage from "@/pages/ideas-page";
import HelpPage from "@/pages/help";
import KidsDrawingPage from "@/pages/kids-drawing";
import AboutPage from "@/pages/about";
import ProductEnhancementPage from "@/pages/product-enhancement";
import ProductEnhancementWebhookPage from "@/pages/product-enhancement-webhook";
import ProductEnhancementDebugPage from "@/pages/product-enhancement-debug";
import ProductEnhancementWebhookSimplePage from "@/pages/product-enhancement-webhook-simple";
import SimpleProductLabPage from "@/pages/simple-product-lab";
import ProductImageLabStaticPage from "@/pages/product-image-lab-static";
import ProductImageFixedPage from "@/pages/product-image-fixed";
import FixedProductLabPage from "@/pages/fixed-product-lab";
import RouterDebugPage from "@/pages/router-debug";
import DemoPage from "@/pages/demo";
import FeaturesDemoPage from "@/pages/features-demo";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import DeviceFingerprint from "@/components/DeviceFingerprint";
import ScrollToTop from "@/components/ScrollToTop";
import ProductImageLabPage from './pages/product-image-lab';

// Import protected routes and account pages
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AccountPage from "@/pages/account";
import TransformationsPage from "./pages/transformations";
import MyImages from "./pages/my-images";
import CheckoutPage from "./pages/checkout";
import SubscribePage from "@/pages/subscribe";
import BuyCreditsPage from "@/pages/buy-credits";
import CheckoutDemoPage from "@/pages/checkout-demo";
import CheckoutFlowDemoPage from "@/pages/checkout-flow-demo";
import UploadPage from "@/pages/upload";
import UploadEnhancePage from "@/pages/upload-enhance";
import SelectIdeasPage from "@/pages/select-ideas";
import GenerateEnhancementsPage from "@/pages/generate-enhancements";
import ResultsPage from "@/pages/results";
import ViewTransformation from "@/pages/view-transformation";
import TextToImageResults from "@/pages/text-to-image-results";
import CheckoutDemo from "@/pages/checkout-demo";
import CheckoutFlowDemo from "@/pages/checkout-flow-demo";
import PrebuiltPrompts from "./pages/prebuilt-prompts";
import PrebuiltUpload from "./pages/prebuilt-upload";
import PrebuiltResults from "./pages/prebuilt-results";
import MySavedImages from "./pages/my-saved-images";
import Create from "./pages/create";
import DentalLanding from "@/pages/dental-landing";
import KidsLanding from "@/pages/kids-landing";
import CheckoutDental from "@/pages/checkout-dental";
import CheckoutSummer from '@/pages/checkout-summer';
function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={DemoPage} />
        <Route path="/old-home" component={Home} />
        <Route path="/pricing" component={PricingPage} />
        <Route path="/ideas" component={IdeasPage} />
        <Route path="/help" component={HelpPage} />
        <Route path="/kids-drawing" component={KidsDrawingPage} />
        <Route path="/upload" component={UploadPage} />
        <Route path="/upload-enhance" component={UploadEnhancePage} />
        <Route path="/select-ideas" component={SelectIdeasPage} />
        <Route path="/generate-enhancements" component={GenerateEnhancementsPage} />
        <Route path="/results" component={ResultsPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/product-enhancement" component={ProductEnhancementPage} />
        <Route path="/product-enhancement-webhook" component={ProductEnhancementWebhookPage} />
        <Route path="/product-enhancement-webhook-simple" component={ProductEnhancementWebhookSimplePage} />
        <Route path="/product-enhancement-debug" component={ProductEnhancementDebugPage} />
        <Route path="/product-image-lab" component={ProductImageLabPage} />
        <Route path="/product-image-lab-simple" component={SimpleProductLabPage} />
        <Route path="/product-image-lab-static" component={ProductImageLabStaticPage} />
        <Route path="/product-image-lab-fixed" component={ProductImageFixedPage} />
        <Route path="/fixed-product-lab" component={FixedProductLabPage} />
        <Route path="/features-demo" component={FeaturesDemoPage} />
        <Route path="/webhook-test" component={() => {
          // This is a simpler way to import the component without TypeScript errors
          const WebhookTest = require("../pages/webhook-test").default;
          return <WebhookTest />;
        }} />
        <Route path="/n8n-test" component={() => {
          // Import the N8N test page
          const N8NTest = require("../pages/n8n-test").default;
          return <N8NTest />;
        }} />
        <Route path="/router-debug" component={RouterDebugPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/login">
          {() => <Redirect to="/auth?tab=login" />}
        </Route>
        <Route path="/register">
          {() => <Redirect to="/auth" />}
        </Route>
        <ProtectedRoute path="/account" component={AccountPage} />
        <ProtectedRoute path="/transformations" component={TransformationsPage} />
        <ProtectedRoute path="/my-images" component={MyImages} />
        <ProtectedRoute path="/checkout" component={CheckoutPage} />
        <ProtectedRoute path="/subscribe" component={SubscribePage} />
        <ProtectedRoute path="/buy-credits" component={BuyCreditsPage} />
        <Route path="/checkout-demo" component={CheckoutDemoPage} />
        <Route path="/checkout-flow-demo" component={CheckoutFlowDemoPage} />
        <Route path="/dental" component={DentalLanding} />
        <Route path="/checkout-dental" component={CheckoutDental} />
        <Route path="/checkout-summer" component={CheckoutSummer} />
        <Route path="/kids" component={KidsLanding} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  // Set dark mode based on user's preference
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check for user preference
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }

    // Disable browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Ensure page starts at top
    window.scrollTo(0, 0);

    // Handle page visibility changes to reset scroll position
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {/* Generate and store device fingerprint */}
          <DeviceFingerprint />
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;