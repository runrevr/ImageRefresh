import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { useAuth } from './useAuth';

export type UserCredits = {
  credits: number;
  paidCredits: number;
  freeCreditsUsed: boolean;
};

export function useCredits(): UseQueryResult<UserCredits> {
  const { user } = useAuth();
  
  return useQuery<UserCredits, Error>({
    queryKey: ['/api/user/credits'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!user, // Only fetch if user is logged in
    // Return default values on error to prevent UI breaks
    onError: (error) => {
      console.error('Error fetching user credits:', error);
    },
    // Default empty credits object on error
    placeholderData: {
      credits: 0,
      paidCredits: 0,
      freeCreditsUsed: true
    }
  });
}