'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon, XIcon } from '@/components/icons';

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
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <SearchIcon className="w-5 h-5 text-gray-500" />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label="Search"
        className={`
          w-full pl-9 sm:pl-11 pr-9 sm:pr-10 py-2.5 rounded-xl text-sm
          bg-white/5 border border-white/10
          text-white placeholder:text-gray-500
          focus:outline-none focus:border-vettr-accent/40 focus:ring-1 focus:ring-vettr-accent/20 focus:bg-white/[0.07]
          transition-all
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
            text-gray-500 hover:text-white
            transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-vettr-accent/30 rounded-lg
            p-1
          "
          aria-label="Clear search"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
