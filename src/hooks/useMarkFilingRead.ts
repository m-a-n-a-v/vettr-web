'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';

interface UseMarkFilingReadReturn {
  markAsRead: (filingId: string) => Promise<void>;
  isMarking: boolean;
  error: Error | null;
}

/**
 * Hook to mark a filing as read
 * This is a mutation-only hook (no data fetching)
 */
export function useMarkFilingRead(): UseMarkFilingReadReturn {
  const [isMarking, setIsMarking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Mark a filing as read
   * @param filingId - The ID of the filing to mark as read
   */
  const markAsRead = async (filingId: string): Promise<void> => {
    setIsMarking(true);
    setError(null);

    try {
      const response = await api.post(`/filings/${filingId}/read`, {});
      if (!response.success) {
        throw new Error(
          response.error?.message || 'Failed to mark filing as read'
        );
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to mark filing as read');
      setError(error);
      throw error;
    } finally {
      setIsMarking(false);
    }
  };

  return {
    markAsRead,
    isMarking,
    error,
  };
}
