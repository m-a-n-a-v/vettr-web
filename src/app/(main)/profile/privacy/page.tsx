'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeftIcon } from '@/components/icons'

export default function PrivacyPage() {
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
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-2xl p-6 space-y-6">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Last updated: February 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">1. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              We collect information you provide when creating an account, including your email address and display name. We also collect usage data such as your watchlist preferences, alert configurations, and interaction patterns with the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">2. How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Your information is used to personalize your experience, deliver alerts and notifications, improve platform features, and provide customer support. We analyze aggregated usage patterns to enhance our scoring algorithms and user experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">3. Data Storage & Security</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Your data is stored securely using encrypted databases hosted on trusted cloud infrastructure. We implement industry-standard security measures including encryption at rest and in transit, access controls, and regular security audits.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">4. Third-Party Sharing</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              We do not sell, trade, or share your personal information with third parties for marketing purposes. We may share anonymized, aggregated data for analytics. We may disclose information when required by law or to protect our rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">5. Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              You have the right to access, correct, or delete your personal data at any time. You can update your profile information through the app settings. To request a full data export or account deletion, contact us at{' '}
              <a href="mailto:support@vettr.ca" className="text-vettr-accent hover:underline">
                support@vettr.ca
              </a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">6. Cookies & Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              We use essential cookies to maintain your session and preferences. We may use privacy-respecting analytics to understand platform usage. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">7. Changes to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of significant changes via email or in-app notification. Continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-gray-900 dark:text-white font-semibold text-base">8. Contact</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              For privacy-related inquiries, please contact us at{' '}
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
