'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, InfoCircleIcon, XIcon } from '@/components/icons';

// Hook to check for reduced motion preference
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleDismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    if (toast.duration) {
      const duration = toast.duration;
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
      }, 50);

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [toast.duration, handleDismiss]);

  const typeConfig = {
    success: {
      icon: CheckCircleIcon,
      iconColor: 'text-vettr-accent',
      borderColor: 'border-l-vettr-accent',
      progressColor: 'bg-vettr-accent',
    },
    error: {
      icon: XCircleIcon,
      iconColor: 'text-red-400',
      borderColor: 'border-l-red-400',
      progressColor: 'bg-red-400',
    },
    warning: {
      icon: AlertTriangleIcon,
      iconColor: 'text-yellow-400',
      borderColor: 'border-l-yellow-400',
      progressColor: 'bg-yellow-400',
    },
    info: {
      icon: InfoCircleIcon,
      iconColor: 'text-blue-400',
      borderColor: 'border-l-blue-400',
      progressColor: 'bg-blue-400',
    },
  };

  const config = typeConfig[toast.type];
  const IconComponent = config.icon;

  // Use 'alert' role for errors/warnings, 'status' for success/info
  const role = toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status';

  return (
    <motion.div
      role={role}
      aria-live={toast.type === 'error' || toast.type === 'warning' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`
        relative overflow-hidden
        bg-white dark:bg-vettr-card border border-gray-200 dark:border-white/10 rounded-xl shadow-xl
        min-w-[320px] flex items-start gap-3 px-4 py-3
        border-l-2 ${config.borderColor}
      `}
      initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: prefersReducedMotion ? 0 : 20 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${config.iconColor}`}>
        <IconComponent className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white font-medium">{toast.message}</p>
        {toast.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{toast.description}</p>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="
          flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white
          transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-vettr-accent/30 rounded
          p-0.5
        "
        aria-label="Dismiss"
      >
        <XIcon className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      {toast.duration && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-white/5">
          <div
            className={`h-full ${config.progressColor} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export function ToastContainer({
  toasts,
  onDismiss,
  position = 'top-right',
}: ToastContainerProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2`}
      aria-label="Notifications"
      role="region"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
