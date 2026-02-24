'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeftIcon } from '@/components/icons'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-vettr-navy/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Terms of Service</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-2xl p-6 space-y-6">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Last updated: February 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">1. Use of the Platform</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              VETTR provides a research and analytics platform for evaluating small-cap and venture stocks listed on the TSX Venture Exchange (TSX-V), Canadian Securities Exchange (CSE), and related markets. By using VETTR, you agree to use the platform solely for informational and research purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">2. Not Financial Advice</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              The VETTR Score, analytics, alerts, and all information provided on this platform are for informational purposes only and do not constitute financial advice, investment recommendations, or solicitations to buy or sell securities. Always consult a qualified financial advisor before making investment decisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">3. Data Sources</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              VETTR aggregates data from publicly available sources including SEDAR+, TSX-V, CSE filings, and other regulatory databases. While we strive for accuracy, we do not guarantee the completeness, timeliness, or accuracy of any data presented on the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">4. User Responsibility</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              You are solely responsible for your investment decisions. VETTR is a research tool and the information provided should be one of many factors in your investment analysis. Past performance indicators and scores do not guarantee future results.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">5. Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              The VETTR Score methodology, algorithms, user interface, and all original content are the intellectual property of VETTR. You may not reproduce, distribute, or create derivative works from any proprietary content without prior written permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">6. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              VETTR shall not be liable for any losses, damages, or expenses arising from the use of this platform or reliance on the information provided. This includes but is not limited to investment losses, data inaccuracies, or service interruptions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">7. Account Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              You are responsible for maintaining the security of your account credentials. VETTR reserves the right to suspend or terminate accounts that violate these terms, engage in abusive behavior, or attempt to circumvent platform limitations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">8. Governing Law</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              These terms are governed by and construed in accordance with the laws of Canada. Any disputes arising from the use of this platform shall be subject to the exclusive jurisdiction of the courts of Canada.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">9. Contact</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              For questions about these terms, please contact us at{' '}
              <a href="mailto:support@vettr.ca" className="text-vettr-accent hover:underline">
                support@vettr.ca
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
