'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSettings } from '@/hooks/useUserSettings';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SelectDropdown from '@/components/ui/SelectDropdown';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { useToast } from '@/contexts/ToastContext';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import {
  ChevronLeftIcon,
  BellIcon,
  FlagIcon,
  DollarCircleIcon,
  PickaxeIcon,
  UsersIcon,
  CheckCircleIcon,
} from '@/components/icons';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, isLoading, isError, isUpdating, updateSettings } = useUserSettings();
  const { showToast } = useToast();
  const { theme, setTheme: setThemeContext } = useTheme();

  // Local state for form fields
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [alertRedFlag, setAlertRedFlag] = useState(false);
  const [alertFinancing, setAlertFinancing] = useState(false);
  const [alertDrillResult, setAlertDrillResult] = useState(false);
  const [alertManagementChange, setAlertManagementChange] = useState(false);
  const [defaultSortOrder, setDefaultSortOrder] = useState('vetr_score');

  // Initialize form fields when settings load
  useEffect(() => {
    if (settings) {
      setNotificationsEnabled(settings.notifications_enabled);
      setAlertRedFlag(settings.alert_preferences.red_flag);
      setAlertFinancing(settings.alert_preferences.financing);
      setAlertDrillResult(settings.alert_preferences.drill_result);
      setAlertManagementChange(settings.alert_preferences.management_change);
      setDefaultSortOrder(settings.default_sort_order);
    }
  }, [settings]);

  // Handle theme change
  const handleThemeChange = (newTheme: Theme) => {
    setThemeContext(newTheme);
  };

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
          <p className="text-red-400 mb-4">Failed to load settings</p>
          <button
            onClick={() => router.push('/profile')}
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl transition-colors text-gray-900 dark:text-white"
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
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Profile', href: '/profile' },
            { label: 'Settings' }
          ]}
        />

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/profile')}
            className="text-vettr-accent hover:text-vettr-accent/80 mb-3 flex items-center gap-2 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your notification preferences and appearance</p>
        </div>

        {/* Notification Settings Section */}
        <div className="bg-white dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
          </div>

          {/* Enable Notifications Toggle */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <BellIcon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Enable Notifications</p>
                <p className="text-xs text-gray-500">Receive alerts and updates</p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={notificationsEnabled}
              aria-label="Enable notifications"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-vettr-accent/30 focus-visible:outline-none ${
                notificationsEnabled ? 'bg-vettr-accent' : 'bg-white/10'
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
        <div className="bg-white dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alert Preferences</h2>
            <p className="text-xs text-gray-500 mt-1">Choose which types of alerts you want to receive</p>
          </div>

          {/* Red Flag Alerts */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-3">
              <FlagIcon className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Red Flag Alerts</p>
                <p className="text-xs text-gray-500">Get notified of new risk indicators</p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={alertRedFlag}
              aria-label="Red flag alerts"
              onClick={() => setAlertRedFlag(!alertRedFlag)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-vettr-accent/30 focus-visible:outline-none ${
                alertRedFlag ? 'bg-vettr-accent' : 'bg-white/10'
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-3">
              <DollarCircleIcon className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Financing Alerts</p>
                <p className="text-xs text-gray-500">Updates on financing activities</p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={alertFinancing}
              aria-label="Financing alerts"
              onClick={() => setAlertFinancing(!alertFinancing)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-vettr-accent/30 focus-visible:outline-none ${
                alertFinancing ? 'bg-vettr-accent' : 'bg-white/10'
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-3">
              <PickaxeIcon className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Drill Result Alerts</p>
                <p className="text-xs text-gray-500">New drilling results and updates</p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={alertDrillResult}
              aria-label="Drill result alerts"
              onClick={() => setAlertDrillResult(!alertDrillResult)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-vettr-accent/30 focus-visible:outline-none ${
                alertDrillResult ? 'bg-vettr-accent' : 'bg-white/10'
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
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <UsersIcon className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Management Change Alerts</p>
                <p className="text-xs text-gray-500">Executive team changes</p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={alertManagementChange}
              aria-label="Management change alerts"
              onClick={() => setAlertManagementChange(!alertManagementChange)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-vettr-accent/30 focus-visible:outline-none ${
                alertManagementChange ? 'bg-vettr-accent' : 'bg-white/10'
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
        <div className="bg-white dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
          </div>

          {/* Theme Selection */}
          <div className="px-6 py-4">
            <label className="block text-gray-900 dark:text-white font-medium mb-3 text-sm">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {/* Dark Theme */}
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-vettr-accent/10 border-vettr-accent text-gray-900 dark:text-white'
                    : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-7 rounded-md bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full p-1 flex flex-col gap-0.5">
                      <div className="w-full h-0.5 rounded-full bg-gray-600"></div>
                      <div className="w-2/3 h-0.5 rounded-full bg-gray-700"></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium">Dark</span>
                  {theme === 'dark' && (
                    <CheckCircleIcon className="w-4 h-4 text-vettr-accent" />
                  )}
                </div>
              </button>

              {/* Light Theme */}
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  theme === 'light'
                    ? 'bg-vettr-accent/10 border-vettr-accent text-gray-900 dark:text-white'
                    : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-7 rounded-md bg-white border border-gray-300 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full p-1 flex flex-col gap-0.5">
                      <div className="w-full h-0.5 rounded-full bg-gray-300"></div>
                      <div className="w-2/3 h-0.5 rounded-full bg-gray-200"></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium">Light</span>
                  {theme === 'light' && (
                    <CheckCircleIcon className="w-4 h-4 text-vettr-accent" />
                  )}
                </div>
              </button>

              {/* System Theme */}
              <button
                onClick={() => handleThemeChange('system')}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  theme === 'system'
                    ? 'bg-vettr-accent/10 border-vettr-accent text-gray-900 dark:text-white'
                    : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-7 rounded-md overflow-hidden flex border border-gray-300 dark:border-gray-700">
                    <div className="w-1/2 bg-white flex flex-col gap-0.5 p-1">
                      <div className="w-full h-0.5 rounded-full bg-gray-300"></div>
                      <div className="w-2/3 h-0.5 rounded-full bg-gray-200"></div>
                    </div>
                    <div className="w-1/2 bg-gray-900 flex flex-col gap-0.5 p-1">
                      <div className="w-full h-0.5 rounded-full bg-gray-600"></div>
                      <div className="w-2/3 h-0.5 rounded-full bg-gray-700"></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium">System</span>
                  {theme === 'system' && (
                    <CheckCircleIcon className="w-4 h-4 text-vettr-accent" />
                  )}
                </div>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">Choose your preferred theme. Changes apply immediately.</p>
          </div>
        </div>

        {/* Default Settings Section */}
        <div className="bg-white dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Default Settings</h2>
          </div>

          {/* Default Sort Order */}
          <div className="px-6 py-4">
            <label className="block text-gray-900 dark:text-white font-medium mb-2 text-sm">Default Sort Order</label>
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
            <p className="text-xs text-gray-500 mt-2">Default sorting for stock lists</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.push('/profile')}
            className="px-6 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl transition-colors text-gray-900 dark:text-white font-medium"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isUpdating}
            className="px-6 py-2.5 bg-vettr-accent hover:bg-vettr-accent/90 rounded-xl transition-colors text-vettr-navy font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
