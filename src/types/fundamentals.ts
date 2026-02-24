/**
 * TypeScript interfaces for fundamentals data structures
 * Used by the Fundamentals tab and related components
 */

/**
 * Financial Health indicators and metrics
 */
export interface FinancialHealth {
  cashRunwayMonths: number;
  debtCoverageRatio: number; // EBITDA/Interest
  workingCapitalTrend: Array<{
    period: string;
    value: number;
  }>;
  freeCashFlowYield: number; // Percentage
  altmanZScore: number;
  currentRatio: number;
  quickRatio: number;
  interestCoverage: number;
  debtToEquity: number;
  debtToAssets: number;
  grossMargin: number; // Percentage (0-1, e.g., 0.382 for 38.2%)
}

/**
 * Earnings Quality assessment metrics
 */
export interface EarningsQuality {
  accrualsRatio: number;
  cashConversion: number; // Operating Cash Flow / Net Income
  revenueToReceivables: number;
  consecutiveBeats: number; // Number of consecutive quarters beating estimates
  surpriseHistory: Array<{
    quarter: string;
    epsActual: number;
    epsEstimate: number;
    surprise: number;
    surprisePercent: number;
  }>;
  overallScore: number; // 0-100
}

/**
 * Analyst Consensus and recommendations
 */
export interface AnalystConsensus {
  totalAnalysts: number;
  consensus: string; // e.g., "Buy", "Hold", "Sell"
  buyCount: number;
  holdCount: number;
  sellCount: number;
  priceTargetMean: number;
  priceTargetMedian: number;
  priceTargetHigh: number;
  priceTargetLow: number;
  currentPrice: number;
  upsidePercent: number; // Can be negative for downside
  recommendations: Array<{
    period: string;
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  }>;
  recentUpgrades: Array<{
    date: string;
    firm: string;
    action: 'upgrade' | 'downgrade' | 'initiate';
    fromGrade: string;
    toGrade: string;
  }>;
}

/**
 * Peer Comparison Financial metrics
 */
export interface PeerFinancials {
  peers: Array<{
    ticker: string;
    name: string;
    peRatio: number;
    evEbitda: number;
    grossMargin: number; // Percentage
    operatingMargin: number; // Percentage
    revenueGrowth: number; // Percentage
    roic: number; // Return on Invested Capital, percentage
    debtToEquity: number;
    currentScore: number; // VETTR Score 0-100
  }>;
}

/**
 * Financial Statements data for Income Statement, Balance Sheet, and Cash Flow
 */
export interface FinancialStatements {
  annualData: Array<{
    date: string; // e.g., "2024", "2023"
    // Income Statement
    revenue: number;
    costOfRevenue: number;
    grossProfit: number;
    operatingIncome: number;
    netIncome: number;
    // Balance Sheet
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    // Cash Flow
    operatingCashFlow: number;
    capex: number;
    freeCashFlow: number;
  }>;
}

/**
 * Umbrella type containing all fundamentals data for a stock
 */
export interface FundamentalsData {
  ticker: string;
  financialHealth: FinancialHealth;
  earningsQuality: EarningsQuality;
  analystConsensus: AnalystConsensus;
  peerFinancials: PeerFinancials;
  financialStatements: FinancialStatements;
}
