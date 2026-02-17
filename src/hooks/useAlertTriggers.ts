'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { AlertType } from '@/types/api';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AlertTrigger {
  id: string;
  ticker: string;
  alert_type: AlertType;
  title: string;
  message: string;
  triggered_at: string;
  is_read: boolean;
  rule_id: string | null;
}

interface UseAlertTriggersReturn {
  triggers: AlertTrigger[];
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteTrigger: (id: string) => Promise<boolean>;
  isMarkingRead: boolean;
  isMarkingAllRead: boolean;
  isDeletingTrigger: boolean;
}

// ─── Mapping ────────────────────────────────────────────────────────────────

/** Map a single backend alert trigger to the frontend shape */
function mapTriggerFromBackend(raw: Record<string, unknown>): AlertTrigger {
  return {
    id: raw.id as string,
    ticker: (raw.stock_ticker as string) || '',
    alert_type: (raw.alert_type as AlertType) || 'Red Flag',
    title: (raw.title as string) || '',
    message: (raw.message as string) || '',
    triggered_at: (raw.triggered_at as string) || '',
    is_read: raw.is_read === true,
    rule_id: (raw.rule_id as string) || null,
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Hook to fetch triggered alerts with mark-as-read and delete mutations.
 * Replaces the hardcoded mock data on the alerts page.
 */
export function useAlertTriggers(): UseAlertTriggersReturn {
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [isDeletingTrigger, setIsDeletingTrigger] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<AlertTrigger[], Error>(
    '/alerts',
    async (url: string): Promise<AlertTrigger[]> => {
      const response = await api.get<unknown>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch triggered alerts');
      }
      // Backend returns paginated format: { items: [...], pagination: {...} }
      // or it might return data directly as an array
      const responseData = response.data as Record<string, unknown>;
      const items = (responseData.items || responseData) as Record<string, unknown>[];
      if (!Array.isArray(items)) {
        return [];
      }
      return items.map(mapTriggerFromBackend);
    },
    {
      dedupingInterval: 15000, // Cache for 15s — triggers change more frequently
    }
  );

  /**
   * Mark a single triggered alert as read
   */
  const markAsRead = async (id: string): Promise<boolean> => {
    setIsMarkingRead(true);
    const previousData = data;

    try {
      // Optimistic update
      if (data) {
        mutate(
          data.map(t => t.id === id ? { ...t, is_read: true } : t),
          false
        );
      }

      const response = await api.post(`/alerts/${id}/read`);
      if (!response.success) {
        throw new Error('Failed to mark alert as read');
      }

      await mutate();
      return true;
    } catch (err) {
      console.error('Error marking alert as read:', err);
      if (previousData) mutate(previousData, false);
      return false;
    } finally {
      setIsMarkingRead(false);
    }
  };

  /**
   * Mark all triggered alerts as read
   */
  const markAllAsRead = async (): Promise<boolean> => {
    setIsMarkingAllRead(true);
    const previousData = data;

    try {
      // Optimistic update
      if (data) {
        mutate(
          data.map(t => ({ ...t, is_read: true })),
          false
        );
      }

      const response = await api.post('/alerts/read-all');
      if (!response.success) {
        throw new Error('Failed to mark all alerts as read');
      }

      await mutate();
      return true;
    } catch (err) {
      console.error('Error marking all alerts as read:', err);
      if (previousData) mutate(previousData, false);
      return false;
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  /**
   * Delete a triggered alert
   */
  const deleteTrigger = async (id: string): Promise<boolean> => {
    setIsDeletingTrigger(true);
    const previousData = data;

    try {
      // Optimistic update
      if (data) {
        mutate(
          data.filter(t => t.id !== id),
          false
        );
      }

      const response = await api.delete(`/alerts/${id}`);
      if (!response.success) {
        throw new Error('Failed to delete alert');
      }

      await mutate();
      return true;
    } catch (err) {
      console.error('Error deleting alert:', err);
      if (previousData) mutate(previousData, false);
      return false;
    } finally {
      setIsDeletingTrigger(false);
    }
  };

  return {
    triggers: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
    markAsRead,
    markAllAsRead,
    deleteTrigger,
    isMarkingRead,
    isMarkingAllRead,
    isDeletingTrigger,
  };
}
