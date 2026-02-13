'use client'

import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { XIcon, FlagIcon, CheckCircleIcon } from '@/components/icons'

interface FeedbackFormProps {
  isOpen: boolean
  onClose: () => void
}

type FeedbackCategory = 'Bug' | 'Feature' | 'General'

export default function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
  const [category, setCategory] = useState<FeedbackCategory>('General')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { showToast } = useToast()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      showToast('Please enter a message', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call (feedback endpoint not implemented yet)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real implementation, this would call:
      // await api.post('/feedback', { category, message, email })

      // Show success state
      setIsSuccess(true)

      // Reset form after 2 seconds and close
      setTimeout(() => {
        setCategory('General')
        setMessage('')
        setEmail('')
        setIsSuccess(false)
        onClose()
      }, 2000)
    } catch (error) {
      showToast('Failed to submit feedback. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const categories: Array<{
    value: FeedbackCategory
    label: string
    description: string
    icon: React.ReactNode
  }> = [
    {
      value: 'Bug',
      label: 'Bug Report',
      description: 'Report an issue or problem',
      icon: <FlagIcon className="w-6 h-6 text-red-400" />,
    },
    {
      value: 'Feature',
      label: 'Feature Request',
      description: 'Suggest a new feature',
      icon: (
        <svg className="w-6 h-6 text-vettr-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      ),
    },
    {
      value: 'General',
      label: 'General Feedback',
      description: 'Share your thoughts',
      icon: (
        <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-vettr-card border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {isSuccess ? (
          // Success State
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-in zoom-in duration-300">
                <CheckCircleIcon className="w-16 h-16 text-vettr-accent" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Thank you!</h2>
            <p className="text-gray-400">Your feedback has been submitted successfully.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-0 mb-6">
              <h2 className="text-lg font-semibold text-white">Send Feedback</h2>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
              {/* Category Selector as Cards */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      disabled={isSubmitting}
                      className={`p-3 rounded-xl border transition-all text-center ${
                        category === cat.value
                          ? 'bg-vettr-accent/5 border-vettr-accent'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-center mb-2">{cat.icon}</div>
                      <div className="text-xs font-medium text-white">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:border-vettr-accent/40 focus:ring-1 focus:ring-vettr-accent/20 transition-all resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:border-vettr-accent/40 focus:ring-1 focus:ring-vettr-accent/20 transition-all"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide your email if you&apos;d like us to follow up
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-vettr-accent text-vettr-navy font-semibold rounded-xl hover:bg-vettr-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-vettr-navy border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Feedback'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
