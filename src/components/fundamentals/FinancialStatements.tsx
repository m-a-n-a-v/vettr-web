'use client';

import { useState } from 'react';
import { FinancialStatements as FinancialStatementsType } from '@/types/fundamentals';
import { Sparkline } from '@/components/ui/Sparkline';

interface FinancialStatementsProps {
  data: FinancialStatementsType;
}

type StatementSection = 'income' | 'balance' | 'cashflow';

interface LineItem {
  label: string;
  getValue: (period: FinancialStatementsType['annualData'][0]) => number;
}

const incomeStatementItems: LineItem[] = [
  { label: 'Revenue', getValue: (p) => p.revenue },
  { label: 'Cost of Revenue', getValue: (p) => p.costOfRevenue },
  { label: 'Gross Profit', getValue: (p) => p.grossProfit },
  { label: 'Operating Income', getValue: (p) => p.operatingIncome },
  { label: 'Net Income', getValue: (p) => p.netIncome },
];

const balanceSheetItems: LineItem[] = [
  { label: 'Total Assets', getValue: (p) => p.totalAssets },
  { label: 'Total Liabilities', getValue: (p) => p.totalLiabilities },
  { label: 'Total Equity', getValue: (p) => p.totalEquity },
];

const cashFlowItems: LineItem[] = [
  { label: 'Operating Cash Flow', getValue: (p) => p.operatingCashFlow },
  { label: 'Capex', getValue: (p) => p.capex },
  { label: 'Free Cash Flow', getValue: (p) => p.freeCashFlow },
];

/**
 * Format value to $M or $B with appropriate suffix
 */
function formatValue(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000) {
    return `$${(value / 1000).toFixed(1)}B`;
  }
  return `$${value.toFixed(1)}M`;
}

/**
 * Calculate year-over-year growth percentage
 */
function calculateGrowth(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Collapsible section component for each financial statement
 */
function StatementSection({
  title,
  items,
  periods,
  isOpen,
  onToggle,
  icon,
  trendBadge,
  sparklineData,
}: {
  title: string;
  items: LineItem[];
  periods: FinancialStatementsType['annualData'];
  isOpen: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  trendBadge?: {
    label: string;
    value: number; // YoY change percentage
  };
  sparklineData?: number[];
}) {
  return (
    <div className="bg-vettr-card/50 border border-white/5 rounded-2xl overflow-hidden hover:border-vettr-accent/20 transition-all duration-300">
      {/* Header - Clickable */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Trend Badge and Sparkline */}
          {trendBadge && (
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  trendBadge.value >= 0
                    ? 'text-emerald-400 bg-emerald-400/10'
                    : 'text-red-400 bg-red-400/10'
                }`}
              >
                {trendBadge.value >= 0 ? '+' : ''}
                {trendBadge.value.toFixed(1)}%
              </span>
              {sparklineData && sparklineData.length >= 2 && (
                <Sparkline
                  data={sparklineData}
                  width={60}
                  height={20}
                  className="opacity-70"
                />
              )}
            </div>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Content - Collapsible */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5 overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left sticky left-0 bg-vettr-card/80 backdrop-blur-sm">
                  Line Item
                </th>
                {periods.map((period) => (
                  <th
                    key={period.date}
                    className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right"
                  >
                    {period.date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                return (
                  <tr
                    key={item.label}
                    className={`border-b border-white/5 ${
                      idx === items.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-white sticky left-0 bg-vettr-card/80 backdrop-blur-sm">
                      {item.label}
                    </td>
                    {periods.map((period, periodIdx) => {
                      const value = item.getValue(period);
                      const prevPeriod = periods[periodIdx + 1];
                      const growth = prevPeriod
                        ? calculateGrowth(value, item.getValue(prevPeriod))
                        : null;

                      return (
                        <td
                          key={period.date}
                          className="px-4 py-3 text-sm text-right"
                        >
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-white font-medium">
                              {formatValue(value)}
                            </span>
                            {growth !== null && (
                              <span
                                className={`text-xs ${
                                  growth >= 0
                                    ? 'text-emerald-400'
                                    : 'text-red-400'
                                }`}
                              >
                                {growth >= 0 ? '+' : ''}
                                {growth.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function FinancialStatements({ data }: FinancialStatementsProps) {
  const [openSections, setOpenSections] = useState<Set<StatementSection>>(
    new Set()
  );

  const toggleSection = (section: StatementSection) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Calculate YoY changes for trend badges (comparing latest 2 years)
  const latestData = data.annualData[0]; // Most recent year
  const priorData = data.annualData[1]; // Previous year

  const revenueYoY =
    priorData && priorData.revenue !== 0
      ? ((latestData.revenue - priorData.revenue) / Math.abs(priorData.revenue)) * 100
      : 0;

  const assetsYoY =
    priorData && priorData.totalAssets !== 0
      ? ((latestData.totalAssets - priorData.totalAssets) / Math.abs(priorData.totalAssets)) * 100
      : 0;

  const fcfYoY =
    priorData && priorData.freeCashFlow !== 0
      ? ((latestData.freeCashFlow - priorData.freeCashFlow) / Math.abs(priorData.freeCashFlow)) * 100
      : 0;

  return (
    <div className="space-y-4">
      {/* Income Statement */}
      <StatementSection
        title="Income Statement"
        items={incomeStatementItems}
        periods={data.annualData}
        isOpen={openSections.has('income')}
        onToggle={() => toggleSection('income')}
        icon={
          <svg
            className="w-4 h-4 text-vettr-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
          </svg>
        }
        trendBadge={{
          label: 'Revenue YoY',
          value: revenueYoY,
        }}
        sparklineData={data.trends?.revenue}
      />

      {/* Balance Sheet */}
      <StatementSection
        title="Balance Sheet"
        items={balanceSheetItems}
        periods={data.annualData}
        isOpen={openSections.has('balance')}
        onToggle={() => toggleSection('balance')}
        icon={
          <svg
            className="w-4 h-4 text-vettr-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        }
        trendBadge={{
          label: 'Total Assets YoY',
          value: assetsYoY,
        }}
        sparklineData={data.trends?.totalAssets}
      />

      {/* Cash Flow */}
      <StatementSection
        title="Cash Flow Statement"
        items={cashFlowItems}
        periods={data.annualData}
        isOpen={openSections.has('cashflow')}
        onToggle={() => toggleSection('cashflow')}
        icon={
          <svg
            className="w-4 h-4 text-vettr-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        }
        trendBadge={{
          label: 'Free Cash Flow YoY',
          value: fcfYoY,
        }}
        sparklineData={data.trends?.freeCashFlow}
      />
    </div>
  );
}
