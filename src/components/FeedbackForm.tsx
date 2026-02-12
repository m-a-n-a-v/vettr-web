'use client'

import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'

interface FeedbackFormProps {
  isOpen: boolean
  onClose: () => void
}

type FeedbackCategory = 'Bug Report' | 'Feature Request' | 'General Feedback'

export default function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
  const [category, setCategory] = useState<FeedbackCategory>('General Feedback')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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

      showToast('Thank you for your feedback!', 'success')

      // Reset form
      setCategory('General Feedback')
      setMessage('')
      setEmail('')

      onClose()
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

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-primaryLight rounded-lg w-full max-w-md p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Send Feedback</h2>
          <button
            onClick={onClose}
            className="text-textSecondary hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={isSubmitting}
            >
              <option value="Bug Report">Bug Report</option>
              <option value="Feature Request">Feature Request</option>
              <option value="General Feedback">General Feedback</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Message <span className="text-error">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind..."
              rows={6}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Email <span className="text-textMuted text-xs">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={isSubmitting}
            />
            <p className="text-xs text-textMuted mt-1">
              Provide your email if you&apos;d like us to follow up
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border text-textSecondary rounded-lg hover:bg-surface transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-accent text-primary font-medium rounded-lg hover:bg-accentDim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                'Send Feedback'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
