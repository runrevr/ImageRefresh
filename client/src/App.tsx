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
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";

// Import protected routes and account pages
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AccountPage from "@/pages/account";
import TransformationsPage from "@/pages/transformations";
import CheckoutPage from "@/pages/checkout";
import SubscribePage from "@/pages/subscribe";
import BuyCreditsPage from "@/pages/buy-credits";
import CheckoutDemoPage from "@/pages/checkout-demo";
import CheckoutFlowDemoPage from "@/pages/checkout-flow-demo";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/ideas" component={IdeasPage} />
      <Route path="/help" component={HelpPage} />
      <Route path="/kids-drawing" component={KidsDrawingPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login">
        {() => <Redirect to="/auth?tab=login" />}
      </Route>
      <Route path="/register">
        {() => <Redirect to="/auth" />}
      </Route>
      <ProtectedRoute path="/account" component={AccountPage} />
      <ProtectedRoute path="/transformations" component={TransformationsPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/subscribe" component={SubscribePage} />
      <ProtectedRoute path="/buy-credits" component={BuyCreditsPage} />
      <Route path="/checkout-demo" component={CheckoutDemoPage} />
      <Route path="/checkout-flow-demo" component={CheckoutFlowDemoPage} />
      <Route component={NotFound} />
    </Switch>
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
