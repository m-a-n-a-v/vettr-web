'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function SearchInput({
  value,
  onChange,
  onDebouncedChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className = '',
  disabled = false,
  autoFocus = false,
}: SearchInputProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      if (onDebouncedChange) {
        onDebouncedChange(value);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounceMs, onDebouncedChange]);

  const handleClear = useCallback(() => {
    onChange('');
    if (onDebouncedChange) {
      onDebouncedChange('');
    }
  }, [onChange, onDebouncedChange]);

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className="w-5 h-5 text-textMuted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`
          w-full pl-10 pr-10 py-3 rounded-xl
          bg-surface border border-border/50
          text-textPrimary placeholder:text-textMuted
          focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      />

      {/* Clear Button */}
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="
            absolute right-3 top-1/2 transform -translate-y-1/2
            text-textMuted hover:text-textPrimary
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-accent rounded-full
            p-0.5
          "
          aria-label="Clear search"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
