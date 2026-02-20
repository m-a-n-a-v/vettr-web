'use client'

import { useState, useEffect } from 'react'
import { AlertRule, AlertType, AlertFrequency, StockSearchResult } from '@/types/api'
import SearchInput from '@/components/ui/SearchInput'
import SelectDropdown from '@/components/ui/SelectDropdown'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useStockSearch } from '@/hooks/useStockSearch'
import {
  FlagIcon,
  XIcon,
  CheckCircleIcon,
  ChevronRightIcon
} from '@/components/icons'

interface AlertRuleCreatorProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rule: Partial<AlertRule>) => Promise<void>
  isCreating: boolean
  editingRule?: AlertRule | null
  onDelete?: (id: string) => Promise<void>
  isDeleting?: boolean
}

type Step = 1 | 2 | 3 | 4 | 5

// Alert type options with descriptions and SVG icon components
const ALERT_TYPES: { value: AlertType; label: string; description: string; iconColor: string; IconComponent: React.ComponentType<{ className?: string }> }[] = [
  {
    value: 'Red Flag',
    label: 'Red Flag',
    description: 'Get notified when risk indicators are detected',
    iconColor: 'text-red-400',
    IconComponent: FlagIcon,
  },
  {
    value: 'Financing',
    label: 'Financing',
    description: 'Track financing events and capital raises',
    iconColor: 'text-yellow-400',
    IconComponent: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: 'Executive Changes',
    label: 'Executive Changes',
    description: 'Monitor leadership and management changes',
    iconColor: 'text-purple-400',
    IconComponent: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    value: 'Consolidation',
    label: 'Consolidation',
    description: 'Be alerted to share consolidation events',
    iconColor: 'text-blue-400',
    IconComponent: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    value: 'Drill Results',
    label: 'Drill Results',
    description: 'Get updates on new drill result announcements',
    iconColor: 'text-vettr-accent',
    IconComponent: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 15.3m14.8 0A2.108 2.108 0 0121 17.708V18a2.25 2.25 0 01-2.25 2.25h-13.5A2.25 2.25 0 013 18v-.292c0-1.01.714-1.891 1.7-2.115M5 15.3l-.393-.098A9.065 9.065 0 0012 12c2.428 0 4.735.957 6.43 2.615l-.63.283z" />
      </svg>
    ),
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

export default function AlertRuleCreator({ isOpen, onClose, onSubmit, isCreating, editingRule, onDelete, isDeleting }: AlertRuleCreatorProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null)
  const [selectedAlertType, setSelectedAlertType] = useState<AlertType | null>(null)
  const [selectedFrequency, setSelectedFrequency] = useState<AlertFrequency>('Real-time')
  const [condition, setCondition] = useState<Record<string, unknown>>({})
  const [threshold, setThreshold] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { results: stocks, isSearching } = useStockSearch(searchQuery)
  const isEditMode = !!editingRule

  // Pre-fill form when editing
  useEffect(() => {
    if (editingRule && isOpen) {
      // Create a StockSearchResult from the editing rule
      const stockData: StockSearchResult = {
        ticker: editingRule.ticker,
        company_name: '', // We don't have this, but it's required for the type
        sector: '',
        exchange: '',
        vetr_score: 0,
        current_price: 0,
      }
      setSelectedStock(stockData)
      setSelectedAlertType(editingRule.alert_type)
      setSelectedFrequency(editingRule.frequency)
      setCondition(editingRule.condition || {})

      // Extract threshold from condition
      if (editingRule.condition) {
        if (editingRule.condition.min_severity && typeof editingRule.condition.min_severity === 'string') {
          setThreshold(editingRule.condition.min_severity)
        } else if (editingRule.condition.min_amount && typeof editingRule.condition.min_amount === 'number') {
          setThreshold(editingRule.condition.min_amount.toString())
        } else if (editingRule.condition.threshold && typeof editingRule.condition.threshold === 'string') {
          setThreshold(editingRule.condition.threshold)
        }
      }
    }
  }, [editingRule, isOpen])

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

    const ruleData: Partial<AlertRule> = {
      ticker: selectedStock.ticker,
      alert_type: selectedAlertType,
      frequency: selectedFrequency,
      condition: Object.keys(condition).length > 0 ? condition : undefined,
      is_enabled: true,
    }

    // Include ID when editing
    if (isEditMode && editingRule) {
      ruleData.id = editingRule.id
    }

    await onSubmit(ruleData)
    handleClose()
  }

  const handleDeleteClick = async () => {
    if (editingRule && onDelete) {
      await onDelete(editingRule.id)
      setShowDeleteConfirm(false)
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-vettr-card border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-vettr-card border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Alert Rule' : 'Create Alert Rule'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Step {currentStep} of 5</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg p-1 transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator - Horizontal dots with connecting lines */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`relative w-3 h-3 rounded-full transition-all ${
                    step <= currentStep
                      ? 'bg-vettr-accent'
                      : 'bg-gray-200 dark:bg-white/10'
                  }`}
                >
                  {step === currentStep && (
                    <div className="absolute inset-0 bg-vettr-accent rounded-full animate-ping opacity-75" />
                  )}
                </div>
                {index < 4 && (
                  <div
                    className={`w-16 h-0.5 mx-2 transition-all ${
                      step < currentStep ? 'bg-vettr-accent' : 'bg-gray-200 dark:bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 px-1">
            <span className="text-xs text-gray-500">Stock</span>
            <span className="text-xs text-gray-500">Type</span>
            <span className="text-xs text-gray-500">Config</span>
            <span className="text-xs text-gray-500">Frequency</span>
            <span className="text-xs text-gray-500">Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step 1: Stock Selector */}
          {currentStep === 1 && (
            <div className="animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Select Stock</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No stocks found matching &quot;{searchQuery}&quot;
                </div>
              )}

              {!isSearching && stocks.length > 0 && (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {stocks.map((stock) => (
                    <button
                      key={stock.ticker}
                      onClick={() => handleStockSelect(stock)}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-left transition-all hover:bg-gray-100 dark:hover:bg-white/10 hover:border-vettr-accent/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-vettr-accent font-mono">{stock.ticker}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{stock.company_name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 dark:text-gray-500">{stock.sector}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            ${stock.current_price?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searchQuery && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  Start typing to search for stocks...
                </div>
              )}
            </div>
          )}

          {/* Step 2: Alert Type Selection */}
          {currentStep === 2 && (
            <div className="animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Select Alert Type</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Choose what kind of events you want to be notified about for <span className="font-bold text-vettr-accent">{selectedStock?.ticker}</span>.
              </p>

              <div className="grid gap-3">
                {ALERT_TYPES.map((type) => {
                  const Icon = type.IconComponent
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleAlertTypeSelect(type.value)}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-left transition-all hover:bg-vettr-accent/5 hover:border-vettr-accent group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`${type.iconColor} flex-shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 dark:text-white group-hover:text-vettr-accent transition-colors">
                            {type.label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {type.description}
                          </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-vettr-accent transition-colors flex-shrink-0" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Condition Configuration */}
          {currentStep === 3 && (
            <div className="animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Configure Conditions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Set specific conditions for your <span className="font-bold text-vettr-accent">{selectedAlertType}</span> alert.
              </p>

              {selectedAlertType === 'Red Flag' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
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
                  <p className="text-xs text-gray-500 mt-2">
                    You&apos;ll be notified when red flags at or above this severity are detected.
                  </p>
                </div>
              )}

              {selectedAlertType === 'Financing' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                    Minimum Amount (CAD, optional)
                  </label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    placeholder="e.g., 1000000"
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-vettr-accent/40 focus:ring-1 focus:ring-vettr-accent/20 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Leave blank to be notified of all financing events, or set a minimum amount.
                  </p>
                </div>
              )}

              {selectedAlertType === 'Executive Changes' && (
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    You&apos;ll be notified of all executive changes including:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                    <li>New appointments</li>
                    <li>Departures</li>
                    <li>Role changes</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">
                    No additional configuration needed for this alert type.
                  </p>
                </div>
              )}

              {selectedAlertType === 'Consolidation' && (
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    You&apos;ll be notified when share consolidation events occur.
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                    No additional configuration needed for this alert type.
                  </p>
                </div>
              )}

              {selectedAlertType === 'Drill Results' && (
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    You&apos;ll be notified when new drill result announcements are made.
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                    No additional configuration needed for this alert type.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Frequency Selection */}
          {currentStep === 4 && (
            <div className="animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Select Frequency</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Choose how often you want to receive these alerts.
              </p>

              <div className="grid gap-3">
                {FREQUENCY_OPTIONS.map((freq) => (
                  <button
                    key={freq.value}
                    onClick={() => handleFrequencySelect(freq.value)}
                    className={`w-full border rounded-xl p-4 text-left transition-all ${
                      selectedFrequency === freq.value
                        ? 'bg-vettr-accent/10 border-vettr-accent'
                        : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{freq.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{freq.description}</div>
                      </div>
                      {selectedFrequency === freq.value && (
                        <CheckCircleIcon className="w-6 h-6 text-vettr-accent flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Review and Confirm */}
          {currentStep === 5 && (
            <div className="animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Review Alert Rule</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Please review your alert configuration before {isEditMode ? 'updating' : 'creating'} it.
              </p>

              <div className="space-y-3">
                {/* Stock */}
                <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Stock</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {selectedStock?.ticker} - {selectedStock?.company_name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedStock?.sector}</div>
                </div>

                {/* Alert Type */}
                <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Alert Type</div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const alertType = ALERT_TYPES.find((t) => t.value === selectedAlertType)
                      const Icon = alertType?.IconComponent
                      return (
                        <>
                          {Icon && (
                            <div className={alertType?.iconColor}>
                              <Icon className="w-5 h-5" />
                            </div>
                          )}
                          <span className="font-bold text-gray-900 dark:text-white">{selectedAlertType}</span>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Conditions */}
                {Object.keys(condition).length > 0 && (
                  <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Conditions</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {(() => {
                        if (selectedAlertType === 'Red Flag' && condition.min_severity && typeof condition.min_severity === 'string') {
                          return <span>Minimum severity: <span className="font-bold text-gray-900 dark:text-white">{condition.min_severity}</span></span>
                        }
                        if (selectedAlertType === 'Financing' && condition.min_amount && typeof condition.min_amount === 'number') {
                          return <span>Minimum amount: <span className="font-bold text-gray-900 dark:text-white">${condition.min_amount.toLocaleString()} CAD</span></span>
                        }
                        if (condition.threshold && typeof condition.threshold === 'string') {
                          return <span>Threshold: <span className="font-bold text-gray-900 dark:text-white">{condition.threshold}</span></span>
                        }
                        return null
                      })()}
                    </div>
                  </div>
                )}

                {/* Frequency */}
                <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Frequency</div>
                  <div className="font-bold text-gray-900 dark:text-white">{selectedFrequency}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {FREQUENCY_OPTIONS.find((f) => f.value === selectedFrequency)?.description}
                  </div>
                </div>
              </div>

              {!isEditMode && (
                <div className="mt-6 bg-vettr-accent/10 border border-vettr-accent/30 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-vettr-accent flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      This alert rule will be enabled immediately after creation. You can disable it anytime from the Alerts page.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-vettr-card border-t border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={currentStep === 1 ? handleClose : handleBack}
              className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreating || isDeleting}
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            {isEditMode && currentStep === 5 && onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            )}
          </div>

          {currentStep < 5 && currentStep !== 3 && (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !selectedStock) ||
                (currentStep === 2 && !selectedAlertType)
              }
              className="px-6 py-2.5 bg-vettr-accent text-vettr-navy rounded-xl font-semibold hover:bg-vettr-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}

          {currentStep === 3 && (
            <button
              onClick={handleConditionNext}
              className="px-6 py-2.5 bg-vettr-accent text-vettr-navy rounded-xl font-semibold hover:bg-vettr-accent/90 transition-all"
            >
              Next
            </button>
          )}

          {currentStep === 5 && (
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="px-6 py-2.5 bg-vettr-accent text-vettr-navy rounded-xl font-semibold hover:bg-vettr-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Alert Rule' : 'Create Alert Rule'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white dark:bg-vettr-card border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Alert Rule</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this alert rule? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-500/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
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
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
