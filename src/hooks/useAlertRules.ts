'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { AlertRule } from '@/types/api';

interface UseAlertRulesReturn {
  rules: AlertRule[];
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
  createRule: (ruleData: Partial<AlertRule>) => Promise<AlertRule | null>;
  updateRule: (id: string, ruleData: Partial<AlertRule>) => Promise<AlertRule | null>;
  deleteRule: (id: string) => Promise<boolean>;
  toggleRule: (id: string, enabled: boolean) => Promise<boolean>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isToggling: boolean;
}

/**
 * Hook to fetch alert rules with create, update, delete, and toggle mutations
 * @returns Alert rules array, loading/error states, CRUD mutation functions, and mutation loading states
 */
export function useAlertRules(): UseAlertRulesReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<AlertRule[], Error>(
    '/alerts/rules',
    async (url: string): Promise<AlertRule[]> => {
      const response = await api.get<AlertRule[]>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch alert rules');
      }
      return response.data;
    },
    {
      dedupingInterval: 30000, // Cache for 30s
    }
  );

  /**
   * Create a new alert rule
   */
  const createRule = async (ruleData: Partial<AlertRule>): Promise<AlertRule | null> => {
    setIsCreating(true);
    try {
      const response = await api.post<AlertRule>('/alerts/rules', ruleData);
      if (!response.success || !response.data) {
        throw new Error('Failed to create alert rule');
      }
      // Revalidate the cache to include the new rule
      await mutate();
      return response.data;
    } catch (err) {
      console.error('Error creating alert rule:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Update an existing alert rule
   */
  const updateRule = async (
    id: string,
    ruleData: Partial<AlertRule>
  ): Promise<AlertRule | null> => {
    setIsUpdating(true);
    try {
      const response = await api.put<AlertRule>(`/alerts/rules/${id}`, ruleData);
      if (!response.success || !response.data) {
        throw new Error('Failed to update alert rule');
      }
      // Revalidate the cache
      await mutate();
      return response.data;
    } catch (err) {
      console.error('Error updating alert rule:', err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete an alert rule
   */
  const deleteRule = async (id: string): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const response = await api.delete(`/alerts/rules/${id}`);
      if (!response.success) {
        throw new Error('Failed to delete alert rule');
      }
      // Revalidate the cache
      await mutate();
      return true;
    } catch (err) {
      console.error('Error deleting alert rule:', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Enable or disable an alert rule with optimistic updates
   */
  const toggleRule = async (id: string, enabled: boolean): Promise<boolean> => {
    setIsToggling(true);

    // Store current data for potential rollback
    const previousData = data;

    try {
      // Optimistically update the local cache immediately
      if (data) {
        mutate(
          data.map(rule =>
            rule.id === id ? { ...rule, enabled } : rule
          ),
          false // Don't revalidate yet
        );
      }

      // Make the API call
      const endpoint = enabled
        ? `/alerts/rules/${id}/enable`
        : `/alerts/rules/${id}/disable`;
      const response = await api.post(endpoint);
      if (!response.success) {
        throw new Error(`Failed to ${enabled ? 'enable' : 'disable'} alert rule`);
      }

      // Revalidate to get fresh data from server
      await mutate();
      return true;
    } catch (err) {
      console.error(`Error ${enabled ? 'enabling' : 'disabling'} alert rule:`, err);

      // Rollback on error
      if (previousData) {
        mutate(previousData, false);
      }

      return false;
    } finally {
      setIsToggling(false);
    }
  };

  return {
    rules: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
  };
}
