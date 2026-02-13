import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function Button({
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-vettr-accent/30 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-accent text-primary hover:bg-accentDim shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:shadow-[0_0_20px_rgba(0,230,118,0.5)]',
        secondary: 'bg-surface hover:bg-surfaceLight text-textPrimary border border-border',
        outline: 'bg-transparent border-2 border-accent text-accent hover:bg-accent/10',
        ghost: 'bg-transparent text-textSecondary hover:text-textPrimary hover:bg-white/5',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm rounded-lg',
        md: 'px-6 py-3 text-base rounded-xl',
        lg: 'px-8 py-4 text-lg rounded-2xl',
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...(props as any)}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : leftIcon ? (
                <span className="mr-2">{leftIcon}</span>
            ) : null}

            {children}

            {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </motion.button>
    );
}
