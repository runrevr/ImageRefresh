import { useAuth } from "@/hooks/useAuth";
import { Route, useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);
  
  return (
    <Route
      path={path}
      component={() => {
        if (isLoading) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }
        
        if (!user) return null; // Will redirect via useEffect
        
        return <Component />;
      }}
    />
  );
}