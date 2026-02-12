'use client'

import { useState } from 'react'
import { AlertRule, AlertType, AlertFrequency, StockSearchResult } from '@/types/api'
import SearchInput from '@/components/ui/SearchInput'
import SelectDropdown from '@/components/ui/SelectDropdown'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useStockSearch } from '@/hooks/useStockSearch'

interface AlertRuleCreatorProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rule: Partial<AlertRule>) => Promise<void>
  isCreating: boolean
}

type Step = 1 | 2 | 3 | 4 | 5

// Alert type options with descriptions
const ALERT_TYPES: { value: AlertType; label: string; description: string; icon: string }[] = [
  {
    value: 'Red Flag',
    label: 'Red Flag',
    description: 'Get notified when risk indicators are detected',
    icon: '🚩',
  },
  {
    value: 'Financing',
    label: 'Financing',
    description: 'Track financing events and capital raises',
    icon: '💰',
  },
  {
    value: 'Executive Changes',
    label: 'Executive Changes',
    description: 'Monitor leadership and management changes',
    icon: '👔',
  },
  {
    value: 'Consolidation',
    label: 'Consolidation',
    description: 'Be alerted to share consolidation events',
    icon: '📊',
  },
  {
    value: 'Drill Results',
    label: 'Drill Results',
    description: 'Get updates on new drill result announcements',
    icon: '⛏️',
  },
]

// Frequency options
const FREQUENCY_OPTIONS: { value: AlertFrequency; label: string; description: string }[] = [
  {
    value: 'Real-time',
    label: 'Real-time',
    description: 'Instant notifications as events occur',
  },
  {
    value: 'Daily',
    label: 'Daily',
    description: 'Summary digest sent once per day',
  },
  {
    value: 'Weekly',
    label: 'Weekly',
    description: 'Weekly summary of all events',
  },
]

export default function AlertRuleCreator({ isOpen, onClose, onSubmit, isCreating }: AlertRuleCreatorProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null)
  const [selectedAlertType, setSelectedAlertType] = useState<AlertType | null>(null)
  const [selectedFrequency, setSelectedFrequency] = useState<AlertFrequency>('Real-time')
  const [condition, setCondition] = useState<Record<string, unknown>>({})
  const [threshold, setThreshold] = useState('')

  const { results: stocks, isSearching } = useStockSearch(searchQuery)

  const handleClose = () => {
    // Reset all state
    setCurrentStep(1)
    setSearchQuery('')
    setSelectedStock(null)
    setSelectedAlertType(null)
    setSelectedFrequency('Real-time')
    setCondition({})
    setThreshold('')
    onClose()
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step)
    }
  }

  const handleStockSelect = (stock: StockSearchResult) => {
    setSelectedStock(stock)
    setSearchQuery('')
    handleNext()
  }

  const handleAlertTypeSelect = (type: AlertType) => {
    setSelectedAlertType(type)
    handleNext()
  }

  const handleConditionNext = () => {
    // Build condition object based on alert type
    const conditionObj: Record<string, unknown> = {}

    // For Red Flag alerts, threshold is the minimum severity level
    if (selectedAlertType === 'Red Flag' && threshold) {
      conditionObj.min_severity = threshold
    }
    // For Financing alerts, threshold could be minimum amount
    else if (selectedAlertType === 'Financing' && threshold) {
      conditionObj.min_amount = parseFloat(threshold)
    }
    // For other types, store threshold as generic value
    else if (threshold) {
      conditionObj.threshold = threshold
    }

    setCondition(conditionObj)
    handleNext()
  }

  const handleFrequencySelect = (freq: AlertFrequency) => {
    setSelectedFrequency(freq)
    handleNext()
  }

  const handleSubmit = async () => {
    if (!selectedStock || !selectedAlertType) return

    const newRule: Partial<AlertRule> = {
      ticker: selectedStock.ticker,
      alert_type: selectedAlertType,
      frequency: selectedFrequency,
      condition: Object.keys(condition).length > 0 ? condition : undefined,
      is_enabled: true,
    }

    await onSubmit(newRule)
    handleClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-primaryLight rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-primaryLight border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-textPrimary">Create Alert Rule</h2>
            <p className="text-sm text-textSecondary mt-1">Step {currentStep} of 5</p>
          </div>
          <button
            onClick={handleClose}
            className="text-textSecondary hover:text-textPrimary transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step <= currentStep
                      ? 'bg-accent text-primary'
                      : 'bg-surface text-textMuted'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-all ${
                      step < currentStep ? 'bg-accent' : 'bg-surface'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-textSecondary">Stock</span>
            <span className="text-xs text-textSecondary">Type</span>
            <span className="text-xs text-textSecondary">Config</span>
            <span className="text-xs text-textSecondary">Frequency</span>
            <span className="text-xs text-textSecondary">Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step 1: Stock Selector */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Select Stock</h3>
              <p className="text-sm text-textSecondary mb-4">
                Choose which stock you want to create an alert for.
              </p>

              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by ticker or company name..."
                className="mb-4"
              />

              {isSearching && (
                <div className="py-8">
                  <LoadingSpinner size="md" color="accent" centered message="Searching..." />
                </div>
              )}

              {!isSearching && searchQuery && stocks.length === 0 && (
                <div className="py-8 text-center text-textSecondary">
                  No stocks found matching &quot;{searchQuery}&quot;
                </div>
              )}

              {!isSearching && stocks.length > 0 && (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {stocks.map((stock) => (
                    <button
                      key={stock.ticker}
                      onClick={() => handleStockSelect(stock)}
                      className="w-full bg-surface hover:bg-surfaceLight border border-border rounded-lg p-4 text-left transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-textPrimary">{stock.ticker}</span>
                            <span className="text-sm text-textSecondary">{stock.company_name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-textMuted">{stock.sector}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-textPrimary">
                            ${stock.current_price?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searchQuery && (
                <div className="py-8 text-center text-textSecondary">
                  Start typing to search for stocks...
                </div>
              )}
            </div>
          )}

          {/* Step 2: Alert Type Selection */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Select Alert Type</h3>
              <p className="text-sm text-textSecondary mb-4">
                Choose what kind of events you want to be notified about for <span className="font-bold text-accent">{selectedStock?.ticker}</span>.
              </p>

              <div className="space-y-3">
                {ALERT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleAlertTypeSelect(type.value)}
                    className="w-full bg-surface hover:bg-surfaceLight border border-border rounded-lg p-4 text-left transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{type.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-textPrimary group-hover:text-accent transition-colors">
                          {type.label}
                        </div>
                        <div className="text-sm text-textSecondary mt-1">
                          {type.description}
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-textMuted group-hover:text-accent transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Condition Configuration */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Configure Conditions</h3>
              <p className="text-sm text-textSecondary mb-4">
                Set specific conditions for your <span className="font-bold text-accent">{selectedAlertType}</span> alert.
              </p>

              {selectedAlertType === 'Red Flag' && (
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-2">
                    Minimum Severity Level
                  </label>
                  <SelectDropdown
                    value={threshold}
                    onChange={setThreshold}
                    options={[
                      { value: '', label: 'All Severities' },
                      { value: 'Low', label: 'Low and above' },
                      { value: 'Moderate', label: 'Moderate and above' },
                      { value: 'High', label: 'High and above' },
                      { value: 'Critical', label: 'Critical only' },
                    ]}
                  />
                  <p className="text-xs text-textMuted mt-2">
                    You&apos;ll be notified when red flags at or above this severity are detected.
                  </p>
                </div>
              )}

              {selectedAlertType === 'Financing' && (
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-2">
                    Minimum Amount (CAD, optional)
                  </label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    placeholder="e.g., 1000000"
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <p className="text-xs text-textMuted mt-2">
                    Leave blank to be notified of all financing events, or set a minimum amount.
                  </p>
                </div>
              )}

              {selectedAlertType === 'Executive Changes' && (
                <div className="bg-surface border border-border rounded-lg p-4">
                  <p className="text-sm text-textSecondary">
                    You&apos;ll be notified of all executive changes including:
                  </p>
                  <ul className="list-disc list-inside text-sm text-textSecondary mt-2 space-y-1">
                    <li>New appointments</li>
                    <li>Departures</li>
                    <li>Role changes</li>
                  </ul>
                  <p className="text-xs text-textMuted mt-3">
                    No additional configuration needed for this alert type.
                  </p>
                </div>
              )}

              {selectedAlertType === 'Consolidation' && (
                <div className="bg-surface border border-border rounded-lg p-4">
                  <p className="text-sm text-textSecondary">
                    You&apos;ll be notified when share consolidation events occur.
                  </p>
                  <p className="text-xs text-textMuted mt-3">
                    No additional configuration needed for this alert type.
                  </p>
                </div>
              )}

              {selectedAlertType === 'Drill Results' && (
                <div className="bg-surface border border-border rounded-lg p-4">
                  <p className="text-sm text-textSecondary">
                    You&apos;ll be notified when new drill result announcements are made.
                  </p>
                  <p className="text-xs text-textMuted mt-3">
                    No additional configuration needed for this alert type.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Frequency Selection */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Select Frequency</h3>
              <p className="text-sm text-textSecondary mb-4">
                Choose how often you want to receive these alerts.
              </p>

              <div className="space-y-3">
                {FREQUENCY_OPTIONS.map((freq) => (
                  <button
                    key={freq.value}
                    onClick={() => handleFrequencySelect(freq.value)}
                    className={`w-full border rounded-lg p-4 text-left transition-all ${
                      selectedFrequency === freq.value
                        ? 'bg-accent/10 border-accent'
                        : 'bg-surface hover:bg-surfaceLight border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-textPrimary">{freq.label}</div>
                        <div className="text-sm text-textSecondary mt-1">{freq.description}</div>
                      </div>
                      {selectedFrequency === freq.value && (
                        <svg
                          className="w-6 h-6 text-accent"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Review and Confirm */}
          {currentStep === 5 && (
            <div>
              <h3 className="text-lg font-bold text-textPrimary mb-2">Review Alert Rule</h3>
              <p className="text-sm text-textSecondary mb-4">
                Please review your alert configuration before creating it.
              </p>

              <div className="space-y-4">
                {/* Stock */}
                <div className="bg-surface border border-border rounded-lg p-4">
                  <div className="text-xs text-textMuted mb-1">Stock</div>
                  <div className="font-bold text-textPrimary">
                    {selectedStock?.ticker} - {selectedStock?.company_name}
                  </div>
                  <div className="text-sm text-textSecondary mt-1">{selectedStock?.sector}</div>
                </div>

                {/* Alert Type */}
                <div className="bg-surface border border-border rounded-lg p-4">
                  <div className="text-xs text-textMuted mb-1">Alert Type</div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {ALERT_TYPES.find((t) => t.value === selectedAlertType)?.icon}
                    </span>
                    <span className="font-bold text-textPrimary">{selectedAlertType}</span>
                  </div>
                </div>

                {/* Conditions */}
                {Object.keys(condition).length > 0 && (
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="text-xs text-textMuted mb-1">Conditions</div>
                    <div className="text-sm text-textSecondary">
                      {(() => {
                        if (selectedAlertType === 'Red Flag' && condition.min_severity && typeof condition.min_severity === 'string') {
                          return <span>Minimum severity: <span className="font-bold text-textPrimary">{condition.min_severity}</span></span>
                        }
                        if (selectedAlertType === 'Financing' && condition.min_amount && typeof condition.min_amount === 'number') {
                          return <span>Minimum amount: <span className="font-bold text-textPrimary">${condition.min_amount.toLocaleString()} CAD</span></span>
                        }
                        if (condition.threshold && typeof condition.threshold === 'string') {
                          return <span>Threshold: <span className="font-bold text-textPrimary">{condition.threshold}</span></span>
                        }
                        return null
                      })()}
                    </div>
                  </div>
                )}

                {/* Frequency */}
                <div className="bg-surface border border-border rounded-lg p-4">
                  <div className="text-xs text-textMuted mb-1">Frequency</div>
                  <div className="font-bold text-textPrimary">{selectedFrequency}</div>
                  <div className="text-sm text-textSecondary mt-1">
                    {FREQUENCY_OPTIONS.find((f) => f.value === selectedFrequency)?.description}
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-accent/10 border border-accent/30 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-textSecondary">
                    This alert rule will be enabled immediately after creation. You can disable it anytime from the Alerts page.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-primaryLight border-t border-border px-6 py-4 flex items-center justify-between">
          <button
            onClick={currentStep === 1 ? handleClose : handleBack}
            className="px-4 py-2 text-textSecondary hover:text-textPrimary transition-colors"
            disabled={isCreating}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          {currentStep < 5 && currentStep !== 3 && (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !selectedStock) ||
                (currentStep === 2 && !selectedAlertType)
              }
              className="px-6 py-2 bg-accent text-primary rounded-lg font-bold hover:bg-accentDim transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}

          {currentStep === 3 && (
            <button
              onClick={handleConditionNext}
              className="px-6 py-2 bg-accent text-primary rounded-lg font-bold hover:bg-accentDim transition-all"
            >
              Next
            </button>
          )}

          {currentStep === 5 && (
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="px-6 py-2 bg-accent text-primary rounded-lg font-bold hover:bg-accentDim transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Alert Rule'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
