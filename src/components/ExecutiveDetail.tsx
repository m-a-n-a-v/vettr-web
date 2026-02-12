'use client';

import { Executive } from '@/types/api';
import { useToast } from '@/contexts/ToastContext';

interface ExecutiveDetailProps {
  executive: Executive;
  onClose: () => void;
}

export default function ExecutiveDetail({ executive, onClose }: ExecutiveDetailProps) {
  const { showToast } = useToast();

  // Share executive profile
  const handleShare = async () => {
    const shareText = `${executive.name} - ${executive.title} at ${executive.company}\n` +
      `Tenure: ${executive.years_at_company} years | Experience: ${executive.total_experience_years} years\n` +
      `Specialization: ${executive.specialization}\n` +
      `Ticker: ${executive.ticker}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${executive.name} - ${executive.title}`,
          text: shareText,
        });
      } catch (error) {
        // User cancelled or error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        showToast('Executive profile copied to clipboard', 'success');
      } catch (error) {
        showToast('Failed to copy to clipboard', 'error');
      }
    }
  };

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Get tenure risk color classes
  const getTenureRiskColors = () => {
    switch (executive.tenure_risk) {
      case 'Stable':
        return 'bg-accent/20 text-accent border-accent';
      case 'Watch':
        return 'bg-warning/20 text-warning border-warning';
      case 'Flight Risk':
        return 'bg-error/20 text-error border-error';
      default:
        return 'bg-surface text-textSecondary border-border';
    }
  };

  // Get tenure risk description
  const getTenureRiskDescription = () => {
    switch (executive.tenure_risk) {
      case 'Stable':
        return 'This executive has demonstrated strong tenure stability and is likely to remain with the company for the foreseeable future.';
      case 'Watch':
        return 'This executive shows some indicators that warrant monitoring. Tenure patterns suggest possible transition considerations.';
      case 'Flight Risk':
        return 'This executive shows patterns indicating a higher likelihood of departure. Consider monitoring for succession planning.';
      default:
        return 'Tenure risk assessment unavailable.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="bg-primaryLight rounded-lg border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-primaryLight border-b border-border p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-textPrimary">Executive Profile</h2>
          <div className="flex gap-2">
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-surface transition-colors"
              aria-label="Share executive profile"
            >
              <svg
                className="w-6 h-6 text-textSecondary hover:text-textPrimary transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6 text-textSecondary hover:text-textPrimary transition-colors"
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
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-bold text-3xl">
                {getInitials(executive.name)}
              </span>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-textPrimary mb-1">
                {executive.name}
              </h3>
              <p className="text-lg text-textSecondary mb-2">{executive.title}</p>
              <p className="text-textSecondary mb-3">
                {executive.company} ({executive.ticker})
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-textMuted text-sm">Tenure at Company</p>
                  <p className="text-textPrimary font-semibold">
                    {executive.years_at_company} {executive.years_at_company === 1 ? 'year' : 'years'}
                  </p>
                </div>
                <div>
                  <p className="text-textMuted text-sm">Total Experience</p>
                  <p className="text-textPrimary font-semibold">
                    {executive.total_experience_years} {executive.total_experience_years === 1 ? 'year' : 'years'}
                  </p>
                </div>
              </div>

              {/* Specialization Badge */}
              {executive.specialization && (
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
                    {executive.specialization}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Career Timeline */}
          {executive.career_timeline && executive.career_timeline.length > 0 && (
            <div className="bg-surface rounded-lg p-5 border border-border">
              <h4 className="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Career Timeline
              </h4>
              <div className="space-y-4">
                {executive.career_timeline.map((entry, index) => (
                  <div key={index} className="flex gap-4">
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-accent' : 'bg-surface border-2 border-border'}`} />
                      {index < executive.career_timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-1" />
                      )}
                    </div>

                    {/* Entry details */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h5 className="text-textPrimary font-semibold">{entry.title}</h5>
                        {index === 0 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent">Current</span>
                        )}
                      </div>
                      <p className="text-textSecondary text-sm mb-1">{entry.company}</p>
                      <p className="text-textMuted text-xs">
                        {entry.start_year} - {entry.end_year || 'Present'}
                        {' '}({entry.end_year ? entry.end_year - entry.start_year : new Date().getFullYear() - entry.start_year} {
                          (entry.end_year ? entry.end_year - entry.start_year : new Date().getFullYear() - entry.start_year) === 1 ? 'year' : 'years'
                        })
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {executive.education && executive.education.length > 0 && (
            <div className="bg-surface rounded-lg p-5 border border-border">
              <h4 className="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Education
              </h4>
              <ul className="space-y-2">
                {executive.education.map((edu, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-textPrimary">{edu}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Social Links */}
          {executive.social_links && (executive.social_links.linkedin || executive.social_links.twitter) && (
            <div className="bg-surface rounded-lg p-5 border border-border">
              <h4 className="text-lg font-bold text-textPrimary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Social Links
              </h4>
              <div className="flex flex-wrap gap-3">
                {executive.social_links.linkedin && (
                  <a
                    href={executive.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primaryLight hover:bg-primary border border-border transition-colors"
                  >
                    <svg className="w-5 h-5 text-textSecondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-textPrimary">LinkedIn</span>
                  </a>
                )}
                {executive.social_links.twitter && (
                  <a
                    href={executive.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primaryLight hover:bg-primary border border-border transition-colors"
                  >
                    <svg className="w-5 h-5 text-textSecondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span className="text-textPrimary">Twitter</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Tenure Stability Assessment */}
          <div className={`rounded-lg p-5 border-2 ${getTenureRiskColors()}`}>
            <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tenure Stability: {executive.tenure_risk}
            </h4>
            <p className="text-sm opacity-90">
              {getTenureRiskDescription()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
