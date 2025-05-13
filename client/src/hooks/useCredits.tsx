import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { useAuth } from './useAuth';

export type UserCredits = {
  credits: number;
  paidCredits: number;
  freeCreditsUsed: boolean;
};

export function useCredits(): UseQueryResult<UserCredits, Error> {
  const { user } = useAuth();
  
  return useQuery<UserCredits, Error, UserCredits>({
    queryKey: ['/api/user/credits'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!user, // Only fetch if user is logged in
    retry: false, // Don't retry on errors
    // Default values when data is not available
    placeholderData: {
      credits: 0,
      paidCredits: 0,
      freeCreditsUsed: true
    }
  });
}