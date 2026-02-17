'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeftIcon } from '@/components/icons'

export default function ContactPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-vettr-navy">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-vettr-navy/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">Contact & Support</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Email Support */}
        <div className="bg-vettr-card/30 border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-vettr-accent/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-vettr-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-semibold">Email Support</h2>
              <p className="text-gray-500 text-xs">We typically respond within 24 hours</p>
            </div>
          </div>

          <a
            href="mailto:support@vettr.ca"
            className="block w-full text-center px-6 py-3 bg-vettr-accent/10 text-vettr-accent rounded-xl font-medium hover:bg-vettr-accent/20 transition-colors"
          >
            support@vettr.ca
          </a>
        </div>

        {/* Feedback */}
        <div className="bg-vettr-card/30 border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-semibold">Send Feedback</h2>
              <p className="text-gray-500 text-xs">Help us improve VETTR</p>
            </div>
          </div>

          <a
            href="mailto:support@vettr.ca?subject=VETTR%20Feedback"
            className="block w-full text-center px-6 py-3 bg-blue-500/10 text-blue-400 rounded-xl font-medium hover:bg-blue-500/20 transition-colors"
          >
            Send Feedback Email
          </a>
        </div>

        {/* Common Topics */}
        <div className="bg-vettr-card/30 border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Common Topics</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-8 h-8 bg-yellow-400/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Account & Billing</p>
                <p className="text-gray-500 text-xs">Subscription changes, account deletion, data requests</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-8 h-8 bg-red-400/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Bug Reports</p>
                <p className="text-gray-500 text-xs">Report issues with the app or data</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-8 h-8 bg-green-400/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Feature Requests</p>
                <p className="text-gray-500 text-xs">Suggest new features or improvements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
