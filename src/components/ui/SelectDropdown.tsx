'use client';

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
}

export default function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  className = '',
  disabled = false,
  error,
}: SelectDropdownProps) {
  return (
    <div className={`${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-textSecondary mb-1.5">
          {label}
        </label>
      )}

      {/* Select Wrapper */}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 pr-10 rounded-lg appearance-none
            bg-primaryLight border transition-all duration-200
            text-textPrimary
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error' : 'border-border'}
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Arrow Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
    </div>
  );
}
