
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { useAuth } from './useAuth';

export type UserCredits = {
  totalCredits: number;
  paidCredits: number;
  freeCreditsUsed: boolean;
  id?: number | null;
  hasMonthlyFreeCredit?: boolean;
};

export function useCredits(): UseQueryResult<UserCredits, Error> {
  const { user } = useAuth();
  
  // Determine endpoint based on auth status
  const endpoint = user ? `/api/credits/${user.id}` : '/api/credits/guest';
  
  return useQuery<UserCredits, Error, UserCredits>({
    queryKey: [endpoint],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: true, // Always fetch, for both authenticated and guest users
    retry: false,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    // Default values when data is not available
    placeholderData: {
      totalCredits: user ? 0 : 1, // Guests get 1 free credit, users start with 0
      paidCredits: 0,
      freeCreditsUsed: user ? true : false, // Guests haven't used their free credit yet
      id: user?.id || null,
      hasMonthlyFreeCredit: user ? false : true
    }
  });
}
