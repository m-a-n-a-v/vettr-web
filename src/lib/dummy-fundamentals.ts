/**
 * Dummy Fundamentals Data Generator
 * Generates realistic mock fundamentals data for any ticker
 * Data is deterministic (same ticker always returns same values) using ticker string hash as seed
 */

import { FundamentalsData, FinancialHealth, EarningsQuality, AnalystConsensus, PeerFinancials } from '@/types/fundamentals';

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
 * Main function to generate complete dummy fundamentals data for a ticker
 * Data is deterministic based on ticker hash
 */
export function getDummyFundamentals(ticker: string): FundamentalsData {
  const seed = hashTicker(ticker);
  const rng = new SeededRandom(seed * 1000000);

  return {
    ticker,
    financialHealth: generateFinancialHealth(rng),
    earningsQuality: generateEarningsQuality(rng),
    analystConsensus: generateAnalystConsensus(rng, ticker),
    peerFinancials: generatePeerFinancials(rng, ticker),
  };
}
