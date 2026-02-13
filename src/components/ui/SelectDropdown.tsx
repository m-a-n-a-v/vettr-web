'use client';

import React from 'react';
import { ChevronDownIcon } from '@/components/icons';

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
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
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
            w-full px-4 py-2.5 pr-10 rounded-xl appearance-none text-sm
            bg-white/5 border transition-all
            text-white
            focus:outline-none focus:border-vettr-accent/40 focus:ring-1 focus:ring-vettr-accent/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-400' : 'border-white/10'}
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
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
