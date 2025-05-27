import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { useAuth } from './useAuth';

export type UserCredits = {
  totalCredits: number;
  paidCredits: number;
  freeCreditsUsed: boolean;
};

export function useCredits(): UseQueryResult<UserCredits, Error> {
  const { user } = useAuth();
  
  return useQuery<UserCredits, Error, UserCredits>({
    queryKey: user ? [`/api/credits/${user.id}`] : ['/api/credits/guest'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: true, // Always fetch, for both authenticated and guest users
    retry: false,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    // Default values when data is not available
    placeholderData: {
      totalCredits: 0,
      paidCredits: 0,
      freeCreditsUsed: true
    }
  });
}