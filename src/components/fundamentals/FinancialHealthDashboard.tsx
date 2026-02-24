'use client';

import { FinancialHealth } from '@/types/fundamentals';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface FinancialHealthDashboardProps {
  data: FinancialHealth;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  status: 'good' | 'warning' | 'critical';
  gauge?: number; // 0-100 for circular gauge
}

function MetricCard({ label, value, subtitle, status, gauge }: MetricCardProps) {
  const statusColors = {
    good: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
      gauge: '#00E676',
    },
    warning: {
      text: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/20',
      gauge: '#FBBF24',
    },
    critical: {
      text: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20',
      gauge: '#F87171',
    },
  };

  const colors = statusColors[status];

  // Circular gauge calculations
  const size = 48;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = gauge !== undefined
    ? circumference - (gauge / 100) * circumference
    : circumference;

  return (
    <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5 hover:border-vettr-accent/20 hover:bg-vettr-card/80 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          {label}
        </div>
        {gauge !== undefined && (
          <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${label} gauge at ${gauge.toFixed(0)}%`}>
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Track ring (background) */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={strokeWidth}
              />
              {/* Progress ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={colors.gauge}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="text-2xl font-bold text-white mb-2">
        {value}
      </div>

      {subtitle && (
        <div className={`inline-flex items-center gap-1.5 ${colors.bg} ${colors.border} border rounded-full px-2.5 py-0.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${colors.text}`} style={{ backgroundColor: 'currentColor' }} />
          <span className={`text-xs font-medium ${colors.text}`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}

export function FinancialHealthDashboard({ data }: FinancialHealthDashboardProps) {
  // Helper function to determine cash runway status
  const getCashRunwayStatus = (months: number): 'good' | 'warning' | 'critical' => {
    if (months > 18) return 'good';
    if (months >= 6) return 'warning';
    return 'critical';
  };

  // Helper function to determine Altman Z-Score status
  const getAltmanZStatus = (score: number): { status: 'good' | 'warning' | 'critical'; label: string } => {
    if (score > 2.99) return { status: 'good', label: 'Safe Zone' };
    if (score >= 1.81) return { status: 'warning', label: 'Grey Zone' };
    return { status: 'critical', label: 'Distress Zone' };
  };

  // Helper function to determine debt coverage status
  const getDebtCoverageStatus = (ratio: number): 'good' | 'warning' | 'critical' => {
    if (ratio > 3) return 'good';
    if (ratio >= 1.5) return 'warning';
    return 'critical';
  };

  // Helper function to determine FCF yield status
  const getFCFYieldStatus = (yield_: number): 'good' | 'warning' | 'critical' => {
    if (yield_ > 5) return 'good';
    if (yield_ >= 2) return 'warning';
    return 'critical';
  };

  // Helper function to determine current ratio status
  const getCurrentRatioStatus = (ratio: number): 'good' | 'warning' | 'critical' => {
    if (ratio > 1.5) return 'good';
    if (ratio >= 1.0) return 'warning';
    return 'critical';
  };

  // Helper function to determine debt/equity status
  const getDebtEquityStatus = (ratio: number): 'good' | 'warning' | 'critical' => {
    if (ratio < 0.5) return 'good';
    if (ratio <= 1.0) return 'warning';
    return 'critical';
  };

  const cashRunwayStatus = getCashRunwayStatus(data.cashRunwayMonths);
  const cashRunwayGauge = Math.min((data.cashRunwayMonths / 36) * 100, 100);

  const altmanZ = getAltmanZStatus(data.altmanZScore);

  const debtCoverageStatus = getDebtCoverageStatus(data.debtCoverageRatio);
  const debtCoverageGauge = Math.min((data.debtCoverageRatio / 5) * 100, 100);

  const fcfYieldStatus = getFCFYieldStatus(data.freeCashFlowYield);
  const fcfYieldGauge = Math.min((data.freeCashFlowYield / 10) * 100, 100);

  const currentRatioStatus = getCurrentRatioStatus(data.currentRatio);
  const currentRatioGauge = Math.min((data.currentRatio / 2) * 100, 100);

  const debtEquityStatus = getDebtEquityStatus(data.debtToEquity);
  const debtEquityGauge = Math.max(100 - (data.debtToEquity / 2) * 100, 0);

  return (
    <div>
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="Cash Runway"
          value={`${data.cashRunwayMonths.toFixed(1)} mo`}
          subtitle={cashRunwayStatus === 'good' ? 'Healthy' : cashRunwayStatus === 'warning' ? 'Monitor' : 'Critical'}
          status={cashRunwayStatus}
          gauge={cashRunwayGauge}
        />

        <MetricCard
          label="Altman Z-Score"
          value={data.altmanZScore.toFixed(2)}
          subtitle={altmanZ.label}
          status={altmanZ.status}
        />

        <MetricCard
          label="Debt Coverage"
          value={`${data.debtCoverageRatio.toFixed(1)}x`}
          subtitle={debtCoverageStatus === 'good' ? 'Strong' : debtCoverageStatus === 'warning' ? 'Adequate' : 'Weak'}
          status={debtCoverageStatus}
          gauge={debtCoverageGauge}
        />

        <MetricCard
          label="FCF Yield"
          value={`${data.freeCashFlowYield.toFixed(1)}%`}
          subtitle={fcfYieldStatus === 'good' ? 'Excellent' : fcfYieldStatus === 'warning' ? 'Moderate' : 'Low'}
          status={fcfYieldStatus}
          gauge={fcfYieldGauge}
        />

        <MetricCard
          label="Current Ratio"
          value={data.currentRatio.toFixed(2)}
          subtitle={currentRatioStatus === 'good' ? 'Liquid' : currentRatioStatus === 'warning' ? 'Adequate' : 'Stressed'}
          status={currentRatioStatus}
          gauge={currentRatioGauge}
        />

        <MetricCard
          label="Debt/Equity"
          value={data.debtToEquity.toFixed(2)}
          subtitle={debtEquityStatus === 'good' ? 'Conservative' : debtEquityStatus === 'warning' ? 'Moderate' : 'High Leverage'}
          status={debtEquityStatus}
          gauge={debtEquityGauge}
        />
      </div>

      {/* Working Capital Trend */}
      <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Working Capital Trend</h3>
          <span className="text-xs text-gray-500">Last 4 Quarters</span>
        </div>

        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={data.workingCapitalTrend}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00E676"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          {data.workingCapitalTrend.map((point, idx) => (
            <div key={idx} className="text-center">
              <div className="mb-1">{point.period}</div>
              <div className="text-white font-medium">
                ${(point.value / 1000000).toFixed(1)}M
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
