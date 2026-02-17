'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { AlertRule, AlertType, AlertFrequency } from '@/types/api';

// ─── Field Mapping Helpers ──────────────────────────────────────────────────
// Backend uses snake_case with different field names than the web frontend.
// These mappers bridge the gap.

/** Map backend frequency → web display frequency */
const mapFrequencyFromBackend = (freq: string): 'Real-time' | 'Daily' | 'Weekly' => {
  switch (freq) {
    case 'instant': return 'Real-time';
    case 'daily': return 'Daily';
    case 'weekly': return 'Weekly';
    default: return 'Real-time';
  }
};

/** Map web display frequency → backend frequency */
const mapFrequencyToBackend = (freq: string): string => {
  switch (freq) {
    case 'Real-time': return 'instant';
    case 'Daily': return 'daily';
    case 'Weekly': return 'weekly';
    default: return 'instant';
  }
};

/** Map a single backend alert rule to the web frontend AlertRule shape */
function mapRuleFromBackend(raw: Record<string, unknown>): AlertRule {
  return {
    id: raw.id as string,
    user_id: (raw.user_id as string) || '',
    ticker: (raw.stock_ticker as string) || '',
    alert_type: ((raw.rule_type as string) || 'Red Flag') as AlertType,
    condition: (raw.trigger_conditions as Record<string, unknown>) || {},
    frequency: mapFrequencyFromBackend((raw.frequency as string) || 'instant') as AlertFrequency,
    is_enabled: raw.is_active === true,
    created_at: (raw.created_at as string) || '',
    updated_at: (raw.created_at as string) || '',
  };
}

/** Map frontend AlertRule partial to backend request body */
function mapRuleToBackend(rule: Partial<AlertRule>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (rule.ticker !== undefined) body.stock_ticker = rule.ticker;
  if (rule.alert_type !== undefined) body.rule_type = rule.alert_type;
  if (rule.condition !== undefined) body.trigger_conditions = rule.condition;
  if (rule.frequency !== undefined) body.frequency = mapFrequencyToBackend(rule.frequency);
  if (rule.is_enabled !== undefined) body.is_active = rule.is_enabled;
  return body;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

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
 * Hook to fetch alert rules with create, update, delete, and toggle mutations.
 * Handles field mapping between backend (snake_case) and frontend (camelCase/custom).
 */
export function useAlertRules(): UseAlertRulesReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<AlertRule[], Error>(
    '/alerts/rules',
    async (url: string): Promise<AlertRule[]> => {
      const response = await api.get<unknown[]>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch alert rules');
      }
      // Map each backend rule object to the frontend AlertRule shape
      return (response.data as Record<string, unknown>[]).map(mapRuleFromBackend);
    },
    {
      dedupingInterval: 30000, // Cache for 30s
    }
  );

  /**
   * Create a new alert rule (maps frontend fields → backend)
   */
  const createRule = async (ruleData: Partial<AlertRule>): Promise<AlertRule | null> => {
    setIsCreating(true);
    try {
      const body = mapRuleToBackend(ruleData);
      const response = await api.post<Record<string, unknown>>('/alerts/rules', body);
      if (!response.success || !response.data) {
        throw new Error('Failed to create alert rule');
      }
      // Revalidate the cache to include the new rule
      await mutate();
      return mapRuleFromBackend(response.data);
    } catch (err) {
      console.error('Error creating alert rule:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Update an existing alert rule (maps frontend fields → backend)
   */
  const updateRule = async (
    id: string,
    ruleData: Partial<AlertRule>
  ): Promise<AlertRule | null> => {
    setIsUpdating(true);
    try {
      const body = mapRuleToBackend(ruleData);
      const response = await api.put<Record<string, unknown>>(`/alerts/rules/${id}`, body);
      if (!response.success || !response.data) {
        throw new Error('Failed to update alert rule');
      }
      // Revalidate the cache
      await mutate();
      return mapRuleFromBackend(response.data);
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
            rule.id === id ? { ...rule, is_enabled: enabled } : rule
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
