'use client';

import { Executive } from '@/types/api';
import { useToast } from '@/contexts/ToastContext';
import { ShareIcon, XIcon } from '@/components/icons';

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
        return 'bg-vettr-accent/20 text-vettr-accent border-vettr-accent';
      case 'Watch':
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400';
      case 'Flight Risk':
        return 'bg-red-400/20 text-red-400 border-red-400';
      default:
        return 'bg-white/5 text-gray-400 border-white/10';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="bg-vettr-card border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-vettr-card border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-white">Executive Profile</h2>
          <div className="flex gap-2">
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Share executive profile"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-vettr-accent/20 to-vettr-accent/5 flex items-center justify-center flex-shrink-0">
              <span className="text-vettr-accent font-semibold text-2xl">
                {getInitials(executive.name)}
              </span>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-1">
                {executive.name}
              </h3>
              <p className="text-sm text-gray-400 mb-2">{executive.title}</p>
              <p className="text-sm text-gray-400 mb-4">
                {executive.company} <span className="font-mono text-vettr-accent">({executive.ticker})</span>
              </p>

              {/* Specialization Badge */}
              {executive.specialization && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-gray-400 text-xs font-medium">
                    {executive.specialization}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Tenure Card */}
            <div className="bg-white/[0.03] rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tenure at Company</p>
              <p className="text-lg font-bold text-white">
                {executive.years_at_company} {executive.years_at_company === 1 ? 'year' : 'years'}
              </p>
            </div>
            {/* Total Experience Card */}
            <div className="bg-white/[0.03] rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Experience</p>
              <p className="text-lg font-bold text-white">
                {executive.total_experience_years} {executive.total_experience_years === 1 ? 'year' : 'years'}
              </p>
            </div>
          </div>

          {/* Career Timeline */}
          {executive.career_timeline && executive.career_timeline.length > 0 && (
            <div className="bg-vettr-card/30 rounded-2xl p-6 border border-white/5">
              <h4 className="text-lg font-semibold text-white mb-4">Career Timeline</h4>
              <div className="relative border-l-2 border-white/10 ml-2 space-y-6">
                {executive.career_timeline.map((entry, index) => (
                  <div key={index} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${index === 0 ? 'bg-vettr-accent' : 'bg-white/10 border-2 border-white/20'}`} />

                    {/* Entry details */}
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <h5 className="text-white font-medium">{entry.title}</h5>
                        {index === 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-vettr-accent/10 text-vettr-accent">Current</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-1">{entry.company}</p>
                      <p className="text-gray-500 text-xs">
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
            <div className="bg-vettr-card/30 rounded-2xl p-6 border border-white/5">
              <h4 className="text-lg font-semibold text-white mb-4">Education</h4>
              <ul className="space-y-2">
                {executive.education.map((edu, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-vettr-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300 text-sm">{edu}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Social Links */}
          {executive.social_links && (executive.social_links.linkedin || executive.social_links.twitter) && (
            <div className="bg-vettr-card/30 rounded-2xl p-6 border border-white/5">
              <h4 className="text-lg font-semibold text-white mb-4">Social Links</h4>
              <div className="flex flex-wrap gap-3">
                {executive.social_links.linkedin && (
                  <a
                    href={executive.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors"
                    aria-label="LinkedIn profile"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {executive.social_links.twitter && (
                  <a
                    href={executive.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors"
                    aria-label="Twitter profile"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Tenure Assessment */}
          <div className={`rounded-xl p-5 border-2 ${getTenureRiskColors()}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${executive.tenure_risk === 'Stable' ? 'bg-vettr-accent' : executive.tenure_risk === 'Watch' ? 'bg-yellow-400' : executive.tenure_risk === 'Flight Risk' ? 'bg-red-400' : 'bg-gray-400'}`} />
              <h4 className="text-lg font-semibold">
                Tenure Assessment: {executive.tenure_risk}
              </h4>
            </div>
            <p className="text-sm leading-relaxed">
              {getTenureRiskDescription()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
