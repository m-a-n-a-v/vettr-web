import useSWR from 'swr';
import { useState } from 'react';
import { api } from '@/lib/api-client';
import type { UserSettings } from '@/types/api';

/**
 * Hook for fetching and updating user settings
 */
export function useUserSettings() {
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch user settings
  const { data, error, mutate } = useSWR<UserSettings, Error>(
    '/users/me/settings',
    async (url: string): Promise<UserSettings> => {
      const response = await api.get<UserSettings>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch user settings');
      }
      return response.data;
    },
    {
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  // Update user settings
  const updateSettings = async (settings: Partial<UserSettings>): Promise<boolean> => {
    setIsUpdating(true);
    try {
      const response = await api.put<UserSettings>('/users/me/settings', settings);
      if (!response.success) {
        throw new Error('Failed to update settings');
      }
      // Revalidate cache
      await mutate();
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    settings: data,
    isLoading: !error && !data,
    isError: !!error,
    error,
    isUpdating,
    updateSettings,
    mutate,
  };
}
