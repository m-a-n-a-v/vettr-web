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
 * Short Interest data (unique TMX data)
 */
export interface ShortInterest {
  shortInterest: number; // Number of shares short
  shortInterestPercent: number; // Percentage of float
  daysToCover: number; // Days to cover based on average volume
  asOfDate: string; // Date of the data
}

/**
 * Insider Activity and ownership breakdown
 */
export interface InsiderActivity {
  insidersPercent: number; // Insider ownership percentage
  institutionsPercent: number; // Institutional ownership percentage
  publicPercent: number; // Public ownership percentage
  netBuySellRatio: number; // Net buy/sell ratio (positive = net buying, negative = net selling)
  recentTransactions: Array<{
    name: string; // Insider name
    relation: string; // Relation to company (e.g., "CEO", "Director", "Officer")
    type: 'buy' | 'sell';
    shares: number; // Number of shares
    date: string; // Transaction date
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
  peRatio: number; // Trailing P/E ratio
  peRatioForward: number; // Forward P/E ratio
  dividendYield: number; // Dividend yield percentage (0-10)
  shortInterest: ShortInterest;
  insiderActivity: InsiderActivity;
}
