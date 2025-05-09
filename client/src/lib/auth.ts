import { createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// User type definition
interface User {
  id: number;
  name: string;
  email: string;
  freeCreditsUsed: boolean;
  paidCredits: number;
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  logoutMutation: any;
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  logoutMutation: null
});

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  // Fetch user data
  const { 
    data: user, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    // Skip unauthorized errors to avoid infinite retries
    queryFn: async () => {
      try {
        const response = await fetch('/api/user');
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      } catch (error: any) {
        if (error.status === 401) {
          return null;
        }
        throw error;
      }
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      return response.json();
    },
    onSuccess: () => {
      // Clear user data and invalidate queries
      queryClient.setQueryData(['/api/user'], null);
      queryClient.invalidateQueries();
      // Redirect to home page
      window.location.href = '/';
    }
  });

  return (
    <AuthContext.Provider value={{ 
      user: user || null, 
      isLoading, 
      error: error as Error | null,
      logoutMutation
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Auth hook
export function useAuth() {
  return useContext(AuthContext);
}