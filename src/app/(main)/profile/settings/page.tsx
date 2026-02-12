'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSettings } from '@/hooks/useUserSettings';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SelectDropdown from '@/components/ui/SelectDropdown';
import { useToast } from '@/contexts/ToastContext';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, isLoading, isError, isUpdating, updateSettings } = useUserSettings();
  const { showToast } = useToast();

  // Local state for form fields
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [alertRedFlag, setAlertRedFlag] = useState(false);
  const [alertFinancing, setAlertFinancing] = useState(false);
  const [alertDrillResult, setAlertDrillResult] = useState(false);
  const [alertManagementChange, setAlertManagementChange] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [defaultSortOrder, setDefaultSortOrder] = useState('vetr_score');

  // Initialize form fields when settings load
  useEffect(() => {
    if (settings) {
      setNotificationsEnabled(settings.notifications_enabled);
      setAlertRedFlag(settings.alert_preferences.red_flag);
      setAlertFinancing(settings.alert_preferences.financing);
      setAlertDrillResult(settings.alert_preferences.drill_result);
      setAlertManagementChange(settings.alert_preferences.management_change);
      setTheme(settings.theme);
      setDefaultSortOrder(settings.default_sort_order);
    }
  }, [settings]);

  // Handle save settings
  const handleSaveSettings = async () => {
    const success = await updateSettings({
      notifications_enabled: notificationsEnabled,
      alert_preferences: {
        red_flag: alertRedFlag,
        financing: alertFinancing,
        drill_result: alertDrillResult,
        management_change: alertManagementChange,
      },
      theme,
      default_sort_order: defaultSortOrder,
    });

    if (success) {
      showToast('Settings saved successfully', 'success');
    } else {
      showToast('Failed to save settings', 'error');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-20 md:pb-6">
        <LoadingSpinner size="lg" message="Loading settings..." />
      </div>
    );
  }

  // Error state
  if (isError || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-20 md:pb-6">
        <div className="text-center">
          <p className="text-error mb-4">Failed to load settings</p>
          <button
            onClick={() => router.push('/profile')}
            className="px-4 py-2 bg-primaryLight hover:bg-surfaceLight rounded-lg transition-colors"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-6 px-4 md:px-6 pt-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/profile')}
            className="text-accent hover:text-accentDim mb-3 flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-textSecondary mt-1">Manage your notification preferences and appearance</p>
        </div>

        {/* Notification Settings Section */}
        <div className="bg-primaryLight border border-border rounded-lg p-6 mb-4">
          <h2 className="text-xl font-semibold text-white mb-4">Notification Settings</h2>

          {/* Enable Notifications Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-white font-medium">Enable Notifications</p>
              <p className="text-textSecondary text-sm">Receive alerts and updates</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? 'bg-accent' : 'bg-surface'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Alert Preferences Section */}
        <div className="bg-primaryLight border border-border rounded-lg p-6 mb-4">
          <h2 className="text-xl font-semibold text-white mb-4">Alert Preferences</h2>
          <p className="text-textSecondary text-sm mb-4">Choose which types of alerts you want to receive</p>

          {/* Red Flag Alerts */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚩</span>
              <div>
                <p className="text-white font-medium">Red Flag Alerts</p>
                <p className="text-textSecondary text-sm">Get notified of new risk indicators</p>
              </div>
            </div>
            <button
              onClick={() => setAlertRedFlag(!alertRedFlag)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                alertRedFlag ? 'bg-error' : 'bg-surface'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  alertRedFlag ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Financing Alerts */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-white font-medium">Financing Alerts</p>
                <p className="text-textSecondary text-sm">Updates on financing activities</p>
              </div>
            </div>
            <button
              onClick={() => setAlertFinancing(!alertFinancing)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                alertFinancing ? 'bg-warning' : 'bg-surface'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  alertFinancing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Drill Result Alerts */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⛏️</span>
              <div>
                <p className="text-white font-medium">Drill Result Alerts</p>
                <p className="text-textSecondary text-sm">New drilling results and updates</p>
              </div>
            </div>
            <button
              onClick={() => setAlertDrillResult(!alertDrillResult)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                alertDrillResult ? 'bg-accent' : 'bg-surface'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  alertDrillResult ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Management Change Alerts */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👔</span>
              <div>
                <p className="text-white font-medium">Management Change Alerts</p>
                <p className="text-textSecondary text-sm">Executive team changes</p>
              </div>
            </div>
            <button
              onClick={() => setAlertManagementChange(!alertManagementChange)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                alertManagementChange ? 'bg-warning' : 'bg-surface'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  alertManagementChange ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-primaryLight border border-border rounded-lg p-6 mb-4">
          <h2 className="text-xl font-semibold text-white mb-4">Appearance</h2>

          {/* Dark Mode Toggle */}
          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Theme</label>
            <SelectDropdown
              value={theme}
              onChange={(value) => setTheme(value as 'dark' | 'light' | 'system')}
              options={[
                { value: 'dark', label: 'Dark (Default)' },
                { value: 'light', label: 'Light' },
                { value: 'system', label: 'System' },
              ]}
            />
            <p className="text-textSecondary text-sm mt-2">Choose your preferred theme</p>
          </div>
        </div>

        {/* Default Settings Section */}
        <div className="bg-primaryLight border border-border rounded-lg p-6 mb-4">
          <h2 className="text-xl font-semibold text-white mb-4">Default Settings</h2>

          {/* Default Sort Order */}
          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Default Sort Order</label>
            <SelectDropdown
              value={defaultSortOrder}
              onChange={(value) => setDefaultSortOrder(value)}
              options={[
                { value: 'vetr_score', label: 'VETTR Score' },
                { value: 'price', label: 'Price' },
                { value: 'price_change', label: 'Price Change %' },
                { value: 'name', label: 'Name' },
                { value: 'sector', label: 'Sector' },
              ]}
            />
            <p className="text-textSecondary text-sm mt-2">Default sorting for stock lists</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.push('/profile')}
            className="px-6 py-3 bg-surface hover:bg-surfaceLight rounded-lg transition-colors text-white font-medium"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isUpdating}
            className="px-6 py-3 bg-accent hover:bg-accentDim rounded-lg transition-colors text-primaryDark font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
