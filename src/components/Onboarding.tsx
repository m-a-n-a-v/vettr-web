'use client';

import React, { useState, useEffect } from 'react';

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Slide {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const slides: Slide[] = [
  {
    title: 'Welcome to VETTR',
    description: 'Your comprehensive platform for analyzing Canadian small-cap stocks. VETTR provides real-time insights, red flag detection, and executive pedigree analysis to help you make informed investment decisions.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Pulse - Market Overview',
    description: 'Stay up-to-date with the Pulse tab. View market overview metrics, recent events, top VETTR scores, and top movers. This is your dashboard for quick insights into market activity.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Discovery - Explore Stocks',
    description: 'Discover new investment opportunities. Use the search bar and sector filters to find featured stocks and browse recent filings. Filter by sector to focus on specific industries.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: 'Stocks & VETTR Score',
    description: 'Access detailed stock analysis with our proprietary VETTR Score. View price data, key metrics, executive pedigree, and red flags. Sort and filter stocks to find the best opportunities.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: 'Alerts & Red Flags',
    description: 'Stay informed with custom alerts. Set up notifications for red flags, financing events, executive changes, and more. Monitor critical signals and never miss an important update.',
    icon: (
      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
];

export default function Onboarding({ isOpen, onClose }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCurrentSlide(0);
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide(currentSlide - 1);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [isOpen, currentSlide]);

  const handleClose = () => {
    setCurrentSlide(0);
    onClose();
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleFinish = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Onboarding Content */}
      <div className="relative w-full max-w-2xl bg-primaryLight rounded-xl border border-border shadow-2xl animate-slideUp">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-textMuted hover:text-textPrimary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent rounded-full p-1.5 z-10"
          aria-label="Close onboarding"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Slide Content */}
        <div className="px-8 py-12 md:px-16 md:py-16 min-h-[400px] flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className="text-accent mb-6">
            {slides[currentSlide].icon}
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-textPrimary mb-4">
            {slides[currentSlide].title}
          </h2>

          {/* Description */}
          <p className="text-textSecondary text-base md:text-lg max-w-lg leading-relaxed">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`
                h-2 rounded-full transition-all duration-300
                ${index === currentSlide
                  ? 'w-8 bg-accent'
                  : 'w-2 bg-border hover:bg-textMuted'}
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between px-8 pb-8 md:px-16">
          {/* Skip / Previous */}
          {isFirstSlide ? (
            <button
              type="button"
              onClick={handleClose}
              className="text-textSecondary hover:text-textPrimary transition-colors duration-200 font-medium"
            >
              Skip
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center gap-2 text-textSecondary hover:text-textPrimary transition-colors duration-200 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
          )}

          {/* Next / Get Started */}
          {isLastSlide ? (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 bg-accent hover:bg-accentDim text-primaryDark font-semibold rounded-lg transition-colors duration-200"
            >
              Get Started
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accentDim text-primaryDark font-semibold rounded-lg transition-colors duration-200"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
