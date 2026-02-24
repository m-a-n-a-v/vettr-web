/**
 * Dummy Fundamentals Data Generator
 * Generates realistic mock fundamentals data for any ticker
 * Data is deterministic (same ticker always returns same values) using ticker string hash as seed
 */

import { FundamentalsData, FinancialHealth, EarningsQuality, AnalystConsensus, PeerFinancials, FinancialStatements, ShortInterest, InsiderActivity } from '@/types/fundamentals';

/**
 * Simple hash function to generate a seed from ticker string
 * Returns a number between 0 and 1
 */
function hashTicker(ticker: string): number {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) {
    hash = ((hash << 5) - hash) + ticker.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) / 2147483647;
}

/**
 * Seeded random number generator
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

/**
 * Generate dummy Financial Health data
 */
function generateFinancialHealth(rng: SeededRandom): FinancialHealth {
  const cashRunwayMonths = Math.round(rng.range(3, 36));
  const altmanZScore = parseFloat(rng.range(0.5, 5.0).toFixed(2));
  const currentRatio = parseFloat(rng.range(0.5, 3.0).toFixed(2));
  const quickRatio = parseFloat(rng.range(0.3, 2.5).toFixed(2));
  const debtToEquity = parseFloat(rng.range(0.1, 2.5).toFixed(2));
  const debtToAssets = parseFloat(rng.range(0.05, 0.8).toFixed(2));
  const freeCashFlowYield = parseFloat(rng.range(-2, 12).toFixed(2));
  const debtCoverageRatio = parseFloat(rng.range(0.5, 8.0).toFixed(2));
  const interestCoverage = parseFloat(rng.range(1.0, 15.0).toFixed(2));
  const grossMargin = parseFloat(rng.range(0.15, 0.65).toFixed(3)); // 15% to 65%

  // Generate working capital trend (4 periods)
  const baseWorkingCapital = rng.range(5, 50); // $M
  const workingCapitalTrend = [];
  for (let i = 0; i < 4; i++) {
    const trend = rng.range(-0.15, 0.15); // ±15% variance
    const value = parseFloat((baseWorkingCapital * (1 + trend * i)).toFixed(2));
    workingCapitalTrend.push({
      period: `Q${i + 1} '24`,
      value,
    });
  }

  return {
    cashRunwayMonths,
    debtCoverageRatio,
    workingCapitalTrend,
    freeCashFlowYield,
    altmanZScore,
    currentRatio,
    quickRatio,
    interestCoverage,
    debtToEquity,
    debtToAssets,
    grossMargin,
  };
}

/**
 * Generate dummy Earnings Quality data
 */
function generateEarningsQuality(rng: SeededRandom): EarningsQuality {
  const accrualsRatio = parseFloat(rng.range(0.01, 0.15).toFixed(3));
  const cashConversion = parseFloat(rng.range(0.5, 1.5).toFixed(2));
  const revenueToReceivables = parseFloat(rng.range(3, 12).toFixed(2));

  // Generate earnings surprise history (4 quarters)
  const surpriseHistory = [];
  let consecutiveBeats = 0;
  let lastWasBeat = false;

  for (let i = 0; i < 4; i++) {
    const epsEstimate = parseFloat(rng.range(0.05, 1.5).toFixed(2));
    const surprisePercent = parseFloat(rng.range(-15, 25).toFixed(1)); // Slight bias toward beats
    const surprise = parseFloat((epsEstimate * (surprisePercent / 100)).toFixed(2));
    const epsActual = parseFloat((epsEstimate + surprise).toFixed(2));

    const isBeat = surprise > 0;
    if (i === 3) { // Most recent quarter
      if (isBeat) {
        consecutiveBeats = lastWasBeat ? consecutiveBeats + 1 : 1;
      } else {
        consecutiveBeats = 0;
      }
    }
    lastWasBeat = isBeat;

    surpriseHistory.unshift({
      quarter: `Q${4 - i} '23`,
      epsActual,
      epsEstimate,
      surprise,
      surprisePercent,
    });
  }

  // Calculate overall score based on metrics
  const cashScore = Math.min(100, cashConversion * 60);
  const accrualsScore = Math.max(0, 100 - (accrualsRatio * 500));
  const consistencyScore = Math.min(100, consecutiveBeats * 25 + 40);
  const overallScore = Math.round((cashScore + accrualsScore + consistencyScore) / 3);

  return {
    accrualsRatio,
    cashConversion,
    revenueToReceivables,
    consecutiveBeats,
    surpriseHistory,
    overallScore,
  };
}

/**
 * Generate dummy Analyst Consensus data
 */
function generateAnalystConsensus(rng: SeededRandom, ticker: string): AnalystConsensus {
  const totalAnalysts = Math.round(rng.range(3, 15));
  const currentPrice = parseFloat(rng.range(2, 50).toFixed(2));

  // Distribute analyst ratings
  const buyCount = Math.round(totalAnalysts * rng.range(0.3, 0.6));
  const sellCount = Math.round(totalAnalysts * rng.range(0.05, 0.2));
  const holdCount = totalAnalysts - buyCount - sellCount;

  // Determine consensus
  let consensus: string;
  if (buyCount > holdCount && buyCount > sellCount) {
    consensus = buyCount > totalAnalysts * 0.6 ? 'Strong Buy' : 'Buy';
  } else if (sellCount > buyCount && sellCount > holdCount) {
    consensus = 'Sell';
  } else {
    consensus = 'Hold';
  }

  // Price targets
  const priceTargetMean = parseFloat((currentPrice * rng.range(0.9, 1.4)).toFixed(2));
  const priceTargetMedian = parseFloat((currentPrice * rng.range(0.95, 1.35)).toFixed(2));
  const priceTargetLow = parseFloat((currentPrice * rng.range(0.7, 1.0)).toFixed(2));
  const priceTargetHigh = parseFloat((currentPrice * rng.range(1.2, 1.8)).toFixed(2));
  const upsidePercent = parseFloat((((priceTargetMean - currentPrice) / currentPrice) * 100).toFixed(1));

  // Recommendation trend (4 periods)
  const recommendations = [];
  for (let i = 0; i < 4; i++) {
    const periodTotal = Math.round(rng.range(totalAnalysts * 0.7, totalAnalysts * 1.1));
    const sb = Math.round(periodTotal * rng.range(0.1, 0.3));
    const b = Math.round(periodTotal * rng.range(0.2, 0.4));
    const h = Math.round(periodTotal * rng.range(0.2, 0.4));
    const s = Math.round(periodTotal * rng.range(0.05, 0.15));
    const ss = periodTotal - sb - b - h - s;

    recommendations.push({
      period: `${['Jan', 'Apr', 'Jul', 'Oct'][i]} '24`,
      strongBuy: sb,
      buy: b,
      hold: h,
      sell: s,
      strongSell: Math.max(0, ss),
    });
  }

  // Recent upgrades/downgrades
  const firms = [
    'TD Securities', 'RBC Capital Markets', 'BMO Capital', 'Scotiabank GBM',
    'CIBC World Markets', 'National Bank Financial', 'Canaccord Genuity',
    'Desjardins Securities', 'Raymond James', 'Eight Capital'
  ];
  const grades = ['Strong Buy', 'Buy', 'Outperform', 'Hold', 'Underperform', 'Sell'];

  const recentUpgrades = [];
  for (let i = 0; i < Math.min(5, Math.floor(totalAnalysts / 2)); i++) {
    const action = rng.choice(['upgrade', 'downgrade', 'initiate'] as const);
    const firm = rng.choice(firms);
    const toGrade = rng.choice(grades);
    const fromGrade = action === 'initiate' ? 'N/A' : rng.choice(grades);

    const daysAgo = Math.round(rng.range(1, 90));
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    recentUpgrades.push({
      date: date.toISOString().split('T')[0],
      firm,
      action,
      fromGrade,
      toGrade,
    });
  }

  return {
    totalAnalysts,
    consensus,
    buyCount,
    holdCount,
    sellCount,
    priceTargetMean,
    priceTargetMedian,
    priceTargetHigh,
    priceTargetLow,
    currentPrice,
    upsidePercent,
    recommendations,
    recentUpgrades,
  };
}

/**
 * Generate dummy Peer Financials data
 */
function generatePeerFinancials(rng: SeededRandom, ticker: string): PeerFinancials {
  // Canadian mining/resource peer tickers (typical for VETTR focus)
  const allPeers = [
    { ticker: 'ABX.TO', name: 'Barrick Gold Corp' },
    { ticker: 'K.TO', name: 'Kinross Gold Corp' },
    { ticker: 'AEM.TO', name: 'Agnico Eagle Mines' },
    { ticker: 'WPM.TO', name: 'Wheaton Precious Metals' },
    { ticker: 'FNV.TO', name: 'Franco-Nevada Corp' },
    { ticker: 'EDV.TO', name: 'Endeavour Mining' },
    { ticker: 'OGC.TO', name: 'OceanaGold Corp' },
    { ticker: 'IMG.TO', name: 'IAMGOLD Corp' },
    { ticker: 'ELD.TO', name: 'Eldorado Gold Corp' },
    { ticker: 'YRI.TO', name: 'Yamana Gold Inc' },
  ];

  // Select 5-8 peers randomly (but deterministically)
  const peerCount = Math.round(rng.range(5, 8));
  const selectedPeers = [];
  for (let i = 0; i < peerCount; i++) {
    const peer = allPeers[i % allPeers.length];
    if (peer.ticker !== ticker) {
      selectedPeers.push({
        ticker: peer.ticker,
        name: peer.name,
        peRatio: parseFloat(rng.range(5, 80).toFixed(1)),
        evEbitda: parseFloat(rng.range(3, 25).toFixed(1)),
        grossMargin: parseFloat(rng.range(15, 65).toFixed(1)),
        operatingMargin: parseFloat(rng.range(-10, 40).toFixed(1)),
        revenueGrowth: parseFloat(rng.range(-15, 45).toFixed(1)),
        roic: parseFloat(rng.range(-5, 25).toFixed(1)),
        debtToEquity: parseFloat(rng.range(0.1, 2.5).toFixed(2)),
        currentScore: Math.round(rng.range(30, 95)),
      });
    }
  }

  return { peers: selectedPeers };
}

/**
 * Generate dummy Financial Statements data
 * Creates 4 years of annual data (2021-2024) with realistic growth patterns
 */
function generateFinancialStatements(rng: SeededRandom): FinancialStatements {
  const annualData = [];

  // Base year (2021) starting values in millions
  const baseRevenue = rng.range(50, 500); // $50M - $500M
  const baseGrossMargin = rng.range(0.25, 0.55); // 25% - 55%
  const baseOperatingMargin = rng.range(0.05, 0.25); // 5% - 25%
  const baseNetMargin = rng.range(0.02, 0.15); // 2% - 15%

  // Annual growth rates (can be negative)
  const revenueGrowthRate = rng.range(-0.10, 0.25); // -10% to +25% per year
  const marginExpansion = rng.range(-0.02, 0.03); // Margin expansion/contraction per year

  for (let i = 0; i < 4; i++) {
    const year = 2021 + i;
    const growthFactor = Math.pow(1 + revenueGrowthRate, i);

    // Income Statement
    const revenue = baseRevenue * growthFactor;
    const grossMargin = Math.min(0.75, Math.max(0.10, baseGrossMargin + (marginExpansion * i)));
    const operatingMargin = Math.min(0.45, Math.max(-0.05, baseOperatingMargin + (marginExpansion * i)));
    const netMargin = Math.min(0.30, Math.max(-0.10, baseNetMargin + (marginExpansion * i)));

    const grossProfit = revenue * grossMargin;
    const costOfRevenue = revenue - grossProfit;
    const operatingIncome = revenue * operatingMargin;
    const netIncome = revenue * netMargin;

    // Balance Sheet (scaled to revenue)
    const assetMultiple = rng.range(1.2, 2.5);
    const totalAssets = revenue * assetMultiple;
    const liabilityRatio = rng.range(0.30, 0.65);
    const totalLiabilities = totalAssets * liabilityRatio;
    const totalEquity = totalAssets - totalLiabilities;

    // Cash Flow (related to net income)
    const cashConversion = rng.range(0.8, 1.3);
    const operatingCashFlow = netIncome * cashConversion;
    const capexRatio = rng.range(0.05, 0.20);
    const capex = revenue * capexRatio;
    const freeCashFlow = operatingCashFlow - capex;

    annualData.push({
      date: year.toString(),
      revenue: parseFloat(revenue.toFixed(2)),
      costOfRevenue: parseFloat(costOfRevenue.toFixed(2)),
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      operatingIncome: parseFloat(operatingIncome.toFixed(2)),
      netIncome: parseFloat(netIncome.toFixed(2)),
      totalAssets: parseFloat(totalAssets.toFixed(2)),
      totalLiabilities: parseFloat(totalLiabilities.toFixed(2)),
      totalEquity: parseFloat(totalEquity.toFixed(2)),
      operatingCashFlow: parseFloat(operatingCashFlow.toFixed(2)),
      capex: parseFloat(capex.toFixed(2)),
      freeCashFlow: parseFloat(freeCashFlow.toFixed(2)),
    });
  }

  // Reverse to show most recent first
  return { annualData: annualData.reverse() };
}

/**
 * Generate dummy Short Interest data
 */
function generateShortInterest(rng: SeededRandom): ShortInterest {
  // Short interest as percentage of float (0.5% to 15%)
  const shortInterestPercent = parseFloat(rng.range(0.5, 15).toFixed(2));

  // Estimate shares short based on typical float size (10M-100M shares)
  const estimatedFloat = rng.range(10, 100) * 1000000;
  const shortInterest = Math.round(estimatedFloat * (shortInterestPercent / 100));

  // Days to cover (0.5 to 10 days)
  const daysToCover = parseFloat(rng.range(0.5, 10).toFixed(1));

  // Generate a recent date (within last 2 weeks)
  const daysAgo = Math.floor(rng.range(1, 14));
  const asOfDate = new Date();
  asOfDate.setDate(asOfDate.getDate() - daysAgo);
  const dateString = asOfDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  return {
    shortInterest,
    shortInterestPercent,
    daysToCover,
    asOfDate: dateString,
  };
}

/**
 * Generate dummy Insider Activity data
 */
function generateInsiderActivity(rng: SeededRandom): InsiderActivity {
  // Ownership distribution
  // Insiders: 5% to 35% (Canadian mining companies often have significant insider ownership)
  const insidersPercent = parseFloat(rng.range(5, 35).toFixed(1));

  // Institutions: 10% to 60% (varies widely)
  const institutionsPercent = parseFloat(rng.range(10, 60).toFixed(1));

  // Public: remainder (ensure total is 100%)
  const publicPercent = parseFloat((100 - insidersPercent - institutionsPercent).toFixed(1));

  // Net buy/sell ratio (-1.0 to +1.0)
  // Positive = net buying, negative = net selling
  const netBuySellRatio = parseFloat(rng.range(-1.0, 1.0).toFixed(2));

  // 3-month change in institutional ownership (-15% to +15%)
  const institutionChangePercent = parseFloat(rng.range(-15, 15).toFixed(1));

  // Top 5 holders concentration (20% to 80%)
  const topHoldersConcentration = parseFloat(rng.range(20, 80).toFixed(1));

  // Smart money signal based on institutional change
  let smartMoneySignal: 'accumulating' | 'neutral' | 'distributing';
  if (institutionChangePercent > 5) {
    smartMoneySignal = 'accumulating';
  } else if (institutionChangePercent < -5) {
    smartMoneySignal = 'distributing';
  } else {
    smartMoneySignal = 'neutral';
  }

  // Generate quarterly ownership history (4 quarters)
  const quarterlyOwnershipHistory = [];
  const quarters = ['Q1 \'24', 'Q2 \'24', 'Q3 \'24', 'Q4 \'24'];

  // Work backwards from current ownership
  for (let i = 3; i >= 0; i--) {
    const quarterlyInsidersPercent = i === 3
      ? insidersPercent
      : parseFloat((insidersPercent + rng.range(-3, 3)).toFixed(1));

    const quarterlyInstitutionsPercent = i === 3
      ? institutionsPercent
      : parseFloat((institutionsPercent - (institutionChangePercent / 4) * (3 - i)).toFixed(1));

    quarterlyOwnershipHistory.push({
      quarter: quarters[i],
      insidersPercent: quarterlyInsidersPercent,
      institutionsPercent: quarterlyInstitutionsPercent,
    });
  }

  // Generate recent transactions (5 transactions)
  const insiderNames = [
    'John McDonald',
    'Sarah Chen',
    'Michael Thompson',
    'Jennifer Williams',
    'Robert Martinez',
    'Emily Johnson',
    'David Anderson',
    'Lisa Brown',
  ];

  const relations = ['CEO', 'CFO', 'Director', 'COO', 'VP Operations', 'VP Exploration', 'Chairman', 'Officer'];

  const recentTransactions = [];
  for (let i = 0; i < 5; i++) {
    const name = rng.choice(insiderNames);
    const relation = rng.choice(relations);

    // Bias toward buying if netBuySellRatio is positive, selling if negative
    const isBuy = netBuySellRatio > 0
      ? rng.next() < 0.7  // 70% chance of buy when net buying
      : rng.next() < 0.3; // 30% chance of buy when net selling

    const type: 'buy' | 'sell' = isBuy ? 'buy' : 'sell';

    // Shares traded (1,000 to 500,000)
    const shares = Math.round(rng.range(1, 500) * 1000);

    // Date within last 90 days
    const daysAgo = Math.floor(rng.range(1, 90));
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateString = date.toISOString().split('T')[0];

    recentTransactions.push({
      name,
      relation,
      type,
      shares,
      date: dateString,
    });
  }

  // Sort by date (most recent first)
  recentTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    insidersPercent,
    institutionsPercent,
    publicPercent,
    netBuySellRatio,
    institutionChangePercent,
    topHoldersConcentration,
    smartMoneySignal,
    quarterlyOwnershipHistory,
    recentTransactions,
  };
}

/**
 * Main function to generate complete dummy fundamentals data for a ticker
 * Data is deterministic based on ticker hash
 */
export function getDummyFundamentals(ticker: string): FundamentalsData {
  const seed = hashTicker(ticker);
  const rng = new SeededRandom(seed * 1000000);

  // Generate P/E ratios
  const peRatio = parseFloat(rng.range(5, 80).toFixed(1)); // Trailing P/E
  const peRatioForward = parseFloat(rng.range(4, 70).toFixed(1)); // Forward P/E (typically lower)

  // Generate dividend yield (0-10%, but many mining stocks don't pay dividends)
  const hasDividend = rng.next() > 0.4; // 60% chance of having a dividend
  const dividendYield = hasDividend ? parseFloat(rng.range(0.5, 8.0).toFixed(2)) : 0;

  return {
    ticker,
    financialHealth: generateFinancialHealth(rng),
    earningsQuality: generateEarningsQuality(rng),
    analystConsensus: generateAnalystConsensus(rng, ticker),
    peerFinancials: generatePeerFinancials(rng, ticker),
    financialStatements: generateFinancialStatements(rng),
    peRatio,
    peRatioForward,
    dividendYield,
    shortInterest: generateShortInterest(rng),
    insiderActivity: generateInsiderActivity(rng),
  };
}
