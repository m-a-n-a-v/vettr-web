// =============================================================================
// Portfolio Types
// =============================================================================

export interface Portfolio {
  id: string;
  userId: string;
  connectionType: 'flinks' | 'snaptrade' | 'csv' | 'manual';
  connectionId: string | null;
  connectionStatus: string;
  institutionName: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioHolding {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  average_cost: number | null;
  current_price: number | null;
  current_value: number | null;
  unrealized_pnl: number | null;
  unrealized_pnl_pct: number | null;
  asset_category: 'vettr_coverage' | 'large_cap_ca' | 'global' | 'alternative';
  stock_id: string | null;
  currency: string;
  exchange: string | null;
  sector: string | null;
  vetr_score: number | null;
  price_change_percent: number | null;
}

export interface PortfolioSummary {
  portfolio_id: string;
  connection_type: string;
  institution_name: string | null;
  total_value: number;
  total_cost: number;
  total_pnl: number;
  total_pnl_pct: number;
  vettr_coverage_value: number;
  vettr_coverage_pct: number;
  holdings_count: number;
  last_synced_at: string | null;
}

export interface CategorizedHoldings {
  vettr_coverage: PortfolioHolding[];
  large_cap_ca: PortfolioHolding[];
  global: PortfolioHolding[];
  alternative: PortfolioHolding[];
}

export interface PortfolioSnapshot {
  id: string;
  portfolioId: string;
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPct: number;
  vettrCoverageValue: number;
  vettrCoveragePct: number;
  recordedAt: string;
}

// =============================================================================
// Portfolio Insights Types
// =============================================================================

export type InsightType =
  | 'warrant_overhang'
  | 'cash_runway'
  | 'sedi_insider'
  | 'hold_expiry'
  | 'flow_through'
  | 'executive_pedigree';

export type Severity = 'info' | 'warning' | 'critical';

export interface PortfolioInsight {
  id: string;
  portfolio_id: string;
  holding_id: string | null;
  insight_type: InsightType;
  severity: Severity;
  title: string;
  summary: string;
  data: unknown;
  is_dismissed: boolean;
  expires_at: string | null;
  created_at: string;
}

// =============================================================================
// Portfolio Alerts Types
// =============================================================================

export type AlertType =
  | 'insider_buy'
  | 'insider_sell'
  | 'hold_expiry'
  | 'cash_runway'
  | 'warrant_breach'
  | 'score_change'
  | 'executive_change'
  | 'filing_published'
  | 'flow_through_warning';

export interface PortfolioAlert {
  id: string;
  user_id: string;
  portfolio_id: string | null;
  holding_id: string | null;
  alert_type: AlertType;
  title: string;
  message: string;
  severity: Severity;
  deep_link: string | null;
  is_read: boolean;
  triggered_at: string;
}

// =============================================================================
// News Types
// =============================================================================

export type NewsSource = 'bnn' | 'sedar' | 'tsx_market_maker' | 'press_release' | 'globe_investor';

export interface NewsArticle {
  id: string;
  source: NewsSource;
  source_url: string | null;
  title: string;
  summary: string | null;
  content: string | null;
  image_url: string | null;
  published_at: string;
  tickers: string[];
  sectors: string[];
  is_material: boolean;
}

export interface FilingCalendarEntry {
  id: string;
  stock_id: string | null;
  ticker: string;
  company_name: string;
  filing_type: string;
  expected_date: string;
  actual_date: string | null;
  source_url: string | null;
  status: 'upcoming' | 'filed' | 'overdue';
}
