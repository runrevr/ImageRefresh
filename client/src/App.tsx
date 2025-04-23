import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ViewTransformation from "@/pages/view-transformation";
import { useState, useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/view-transformation" component={ViewTransformation} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
