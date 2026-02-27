'use client';

import { useState, useRef, useCallback } from 'react';
import { usePortfolios, usePortfolioSummary, createPortfolio, deletePortfolio, importCsvHoldings } from '@/hooks/usePortfolio';
import { useToast } from '@/contexts/ToastContext';
import Modal from '@/components/ui/Modal';
import { BriefcaseIcon, LinkIcon } from '@/components/icons';

type ConnectionStep = 'choose' | 'csv-upload' | 'manual-entry';

interface CsvRow {
  ticker: string;
  shares: number;
  avgCost: number;
}

export default function PortfolioManager() {
  const { portfolios, isLoading, mutate: mutatePortfolios } = usePortfolios();
  const { summaries, mutate: mutateSummaries } = usePortfolioSummary();
  const { showToast } = useToast();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [step, setStep] = useState<ConnectionStep>('choose');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // CSV state
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual entry state
  const [manualName, setManualName] = useState('');

  const resetModal = useCallback(() => {
    setStep('choose');
    setCsvRows([]);
    setCsvError(null);
    setManualName('');
    setIsCreating(false);
  }, []);

  const handleClose = () => {
    setShowConnectModal(false);
    resetModal();
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
          setCsvError('CSV must have at least a header row and one data row');
          return;
        }

        const header = lines[0].toLowerCase();
        const hasHeader = header.includes('ticker') || header.includes('symbol');
        const startIdx = hasHeader ? 1 : 0;

        const rows: CsvRow[] = [];
        for (let i = startIdx; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
          if (cols.length < 3) continue;

          const ticker = cols[0].toUpperCase();
          const shares = parseFloat(cols[1]);
          const avgCost = parseFloat(cols[2]);

          if (!ticker || isNaN(shares) || isNaN(avgCost)) continue;
          rows.push({ ticker, shares, avgCost });
        }

        if (rows.length === 0) {
          setCsvError('No valid rows found. Expected format: ticker, shares, average_cost');
          return;
        }

        setCsvRows(rows);
      } catch {
        setCsvError('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleCsvImport = async () => {
    if (csvRows.length === 0) return;
    setIsCreating(true);

    try {
      const portfolio = await createPortfolio({
        connectionType: 'csv',
        institutionName: 'CSV Import',
      });

      await importCsvHoldings(portfolio.id, csvRows);
      await Promise.all([mutatePortfolios(), mutateSummaries()]);
      showToast(`Imported ${csvRows.length} holdings successfully`, 'success');
      handleClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to import CSV', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleManualCreate = async () => {
    setIsCreating(true);
    try {
      await createPortfolio({
        connectionType: 'manual',
        institutionName: manualName || 'My Portfolio',
      });
      await Promise.all([mutatePortfolios(), mutateSummaries()]);
      showToast('Portfolio created. Add holdings from the Stocks page.', 'success');
      handleClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to create portfolio', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (portfolioId: string) => {
    setDeletingId(portfolioId);
    try {
      await deletePortfolio(portfolioId);
      await Promise.all([mutatePortfolios(), mutateSummaries()]);
      showToast('Portfolio removed', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete portfolio', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const getSummary = (portfolioId: string) =>
    summaries.find(s => s.portfolio_id === portfolioId);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const connectionTypeLabel = (type: string) => {
    switch (type) {
      case 'flinks': return 'Flinks';
      case 'snaptrade': return 'SnapTrade';
      case 'csv': return 'CSV Import';
      case 'manual': return 'Manual';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white px-6 py-4 border-b border-gray-200 dark:border-white/5">
          Portfolios
        </h2>
        <div className="px-6 py-4">
          <div className="h-16 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolios</h2>
          <button
            onClick={() => setShowConnectModal(true)}
            className="text-xs font-semibold text-vettr-accent bg-vettr-accent/10 hover:bg-vettr-accent/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Add Portfolio
          </button>
        </div>

        {portfolios.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-vettr-accent/10 flex items-center justify-center mx-auto mb-3">
              <BriefcaseIcon className="w-6 h-6 text-vettr-accent" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">No portfolios connected</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Connect a brokerage or upload a CSV to track your holdings
            </p>
            <button
              onClick={() => setShowConnectModal(true)}
              className="mt-4 px-4 py-2 bg-vettr-accent text-vettr-navy text-sm font-semibold rounded-xl hover:bg-vettr-accent/90 transition-colors"
            >
              Connect Portfolio
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-white/5">
            {portfolios.map((portfolio) => {
              const summary = getSummary(portfolio.id);
              return (
                <div key={portfolio.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {portfolio.institutionName || 'Portfolio'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                          {connectionTypeLabel(portfolio.connectionType)}
                        </span>
                      </div>
                      {summary && (
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatCurrency(summary.total_value)} total</span>
                          <span className={summary.total_pnl >= 0 ? 'text-vettr-accent' : 'text-red-400'}>
                            {summary.total_pnl >= 0 ? '+' : ''}{formatCurrency(summary.total_pnl)} P&L
                          </span>
                          <span>{summary.holdings_count} holdings</span>
                        </div>
                      )}
                      {portfolio.lastSyncedAt && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          Last synced: {new Date(portfolio.lastSyncedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(portfolio.id)}
                      disabled={deletingId === portfolio.id}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 px-2 py-1"
                    >
                      {deletingId === portfolio.id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connect Portfolio Modal */}
      {showConnectModal && (
        <Modal
          isOpen={showConnectModal}
          onClose={handleClose}
          title="Connect Portfolio"
          size="md"
        >
          {step === 'choose' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Choose how to add your portfolio holdings
              </p>

              {/* Brokerage Connection (Coming Soon) */}
              <div className="opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <LinkIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Connect Brokerage</p>
                    <p className="text-xs text-gray-500">Auto-sync from Questrade, Wealthsimple, and more</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">Coming Soon</span>
                  </div>
                </div>
              </div>

              {/* CSV Upload */}
              <button
                onClick={() => setStep('csv-upload')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-vettr-accent/30 hover:bg-vettr-accent/5 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Upload CSV</p>
                  <p className="text-xs text-gray-500">Import holdings from a CSV file (ticker, shares, avg cost)</p>
                </div>
              </button>

              {/* Manual Entry */}
              <button
                onClick={() => setStep('manual-entry')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-vettr-accent/30 hover:bg-vettr-accent/5 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Manual Entry</p>
                  <p className="text-xs text-gray-500">Create a portfolio and add holdings one by one</p>
                </div>
              </button>
            </div>
          )}

          {step === 'csv-upload' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('choose')}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Upload a CSV file with columns: <code className="text-xs bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">ticker, shares, average_cost</code>
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl hover:border-vettr-accent/30 transition-colors text-center"
                >
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm text-gray-500">Click to select a CSV file</p>
                </button>
              </div>

              {csvError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                  {csvError}
                </div>
              )}

              {csvRows.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Preview ({csvRows.length} holdings)
                  </p>
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-white/5 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium text-gray-500">Ticker</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-500">Shares</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-500">Avg Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {csvRows.slice(0, 20).map((row, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 font-mono font-semibold text-vettr-accent">{row.ticker}</td>
                            <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{row.shares.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right text-gray-900 dark:text-white">${row.avgCost.toFixed(2)}</td>
                          </tr>
                        ))}
                        {csvRows.length > 20 && (
                          <tr>
                            <td colSpan={3} className="px-3 py-2 text-center text-gray-400">
                              ...and {csvRows.length - 20} more
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={handleCsvImport}
                    disabled={isCreating}
                    className="w-full mt-3 px-4 py-2.5 bg-vettr-accent text-vettr-navy font-semibold rounded-xl hover:bg-vettr-accent/90 transition-colors disabled:opacity-50 text-sm"
                  >
                    {isCreating ? 'Importing...' : `Import ${csvRows.length} Holdings`}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'manual-entry' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('choose')}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5">
                  Portfolio Name
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g., Questrade TFSA, Wealthsimple"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:border-vettr-accent/50 focus:ring-1 focus:ring-vettr-accent/20 transition-all"
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                After creating the portfolio, you can add holdings individually from the Stocks page or the AI page.
              </p>

              <button
                onClick={handleManualCreate}
                disabled={isCreating}
                className="w-full px-4 py-2.5 bg-vettr-accent text-vettr-navy font-semibold rounded-xl hover:bg-vettr-accent/90 transition-colors disabled:opacity-50 text-sm"
              >
                {isCreating ? 'Creating...' : 'Create Portfolio'}
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
