import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";

console.log("1️⃣ App.tsx - File loaded");

// Don't import ANY components yet
console.log("2️⃣ App.tsx - About to define App component");

function App() {
  console.log("3️⃣ App component - Rendering started");

  // Set dark mode based on user's preference
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    console.log("4️⃣ App component - useEffect running");
    const isDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  console.log("5️⃣ App component - About to return JSX");

  return (
    <div>
      {console.log("6️⃣ App component - Rendering ErrorBoundary")}
      <QueryClientProvider client={queryClient}>
        {console.log("7️⃣ App component - Inside QueryClientProvider")}
        <AuthProvider>
          {console.log("8️⃣ App component - Inside AuthProvider - NOW useAuth should work")}
          <TooltipProvider>
            {console.log("9️⃣ App component - Inside TooltipProvider")}
            <div>
              <h1>Debug App Running</h1>
              <p>Check console for numbered logs</p>
              <p>If you see this, the providers are working</p>
            </div>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

console.log("🔟 App.tsx - App component defined");

export default App;

console.log("1️⃣1️⃣ App.tsx - Export complete");