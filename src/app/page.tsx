'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api-client'
import Link from 'next/link'

interface AutocompleteResult {
  ticker: string
  company_name: string
  exchange: string
  sector: string
}

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AutocompleteResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(null)

  // Redirect authenticated users to /pulse
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/pulse')
    }
  }, [isAuthenticated, authLoading, router])

  // Debounced search
  const searchStocks = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([])
      setShowResults(false)
      return
    }
    setIsSearching(true)
    try {
      const response = await api.get<AutocompleteResult[]>(`/stocks/autocomplete?q=${encodeURIComponent(q)}&limit=8`)
      if (response.success && response.data) {
        setResults(response.data)
        setShowResults(true)
      }
    } catch {
      // silent
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchStocks(query), 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, searchStocks])

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (ticker: string) => {
    router.push(`/stocks/${ticker}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault()
      handleSelect(results[selectedIndex].ticker)
    }
  }

  // Show nothing while checking auth (prevents flash)
  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-vettr-navy flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vettr-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vettr-navy flex flex-col">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-vettr-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-vettr-accent/20 flex items-center justify-center">
            <span className="text-vettr-accent font-bold text-sm">V</span>
          </div>
          <span className="text-white font-bold text-lg">VETTR</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 bg-vettr-accent text-vettr-navy font-semibold rounded-lg hover:bg-vettr-accent/90 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        {/* Hero text */}
        <div className="text-center mb-8 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Is your stock hiding{' '}
            <span className="text-vettr-accent">red flags</span>?
          </h1>
          <p className="text-lg text-gray-400">
            Enter any TSX or TSX-V ticker to run a free VETTR Red Flag Diagnostic
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-xl relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIndex(-1) }}
              onKeyDown={handleKeyDown}
              onFocus={() => results.length > 0 && setShowResults(true)}
              placeholder="Search by ticker or company name (e.g. AAPL, Barrick Gold)"
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vettr-accent/50 focus:border-vettr-accent/50 transition-all"
              autoFocus
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <div className="w-5 h-5 border-2 border-vettr-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Search results dropdown */}
          {showResults && results.length > 0 && (
            <div
              ref={resultsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-vettr-card border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {results.map((result, index) => (
                <button
                  key={result.ticker}
                  onClick={() => handleSelect(result.ticker)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors ${
                    selectedIndex === index ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{result.ticker}</span>
                        <span className="text-[10px] text-gray-500 uppercase">{result.exchange}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate max-w-[250px]">{result.company_name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">{result.sector}</span>
                </button>
              ))}
            </div>
          )}

          {showResults && results.length === 0 && query.length > 0 && !isSearching && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-vettr-card border border-white/10 rounded-xl shadow-2xl p-6 text-center z-50">
              <p className="text-gray-400 text-sm">No stocks found for &ldquo;{query}&rdquo;</p>
              <p className="text-gray-500 text-xs mt-1">Try a different ticker or company name</p>
            </div>
          )}
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
          {[
            { icon: '🔍', title: 'Red Flag Detection', desc: 'AI-powered detection of dilution, insider selling, and cash runway risks' },
            { icon: '📊', title: 'VETTR Score', desc: 'Proprietary 0-100 score across 4 pillars of due diligence' },
            { icon: '🏆', title: 'Executive Pedigree', desc: 'Track record analysis of management teams and their exits' },
          ].map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6">
        <p className="text-xs text-gray-600">
          VETTR &middot; AI-Powered Stock Due Diligence for Canadian Small-Cap Investors
        </p>
      </footer>
    </div>
  )
}
