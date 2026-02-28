// =============================================================================
// API Response Wrapper Types
// =============================================================================

/**
 * Standard API response wrapper for all endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    request_id: string;
  };
}

/**
 * API error response structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// =============================================================================
// User & Authentication Types
// =============================================================================

/**
 * User account information
 */
export interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  updated_at: string;
  tier: 'free' | 'pro' | 'premium';
  auth_provider?: 'email' | 'google' | 'apple';
}

/**
 * User settings/preferences
 */
export interface UserSettings {
  notifications_enabled: boolean;
  alert_preferences: {
    red_flag: boolean;
    financing: boolean;
    drill_result: boolean;
    management_change: boolean;
  };
  theme: 'dark' | 'light' | 'system';
  default_sort_order: string;
}

/**
 * Authentication response from login/signup
 */
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

// =============================================================================
// Subscription Types
// =============================================================================

/**
 * User subscription details
 */
export interface Subscription {
  tier: 'free' | 'pro' | 'premium';
  watchlist_limit: number;
  stocks_tracked_count: number;
  features: string[];
  billing_period?: 'monthly' | 'annual';
  expires_at?: string;
}

// =============================================================================
// Stock Types
// =============================================================================

/**
 * Stock entity
 */
export interface Stock {
  ticker: string;
  company_name: string;
  sector: string;
  exchange: string;
  market_cap: number;
  current_price: number;
  price_change_percent: number;
  vetr_score: number;
  filings_count: number;
  is_watchlisted: boolean;
  last_updated: string;
}

/**
 * Stock search result (may have partial data)
 */
export interface StockSearchResult {
  ticker: string;
  company_name: string;
  sector: string;
  exchange: string;
  vetr_score: number;
  current_price: number;
}

// =============================================================================
// Filing Types
// =============================================================================

/**
 * Filing type
 */
export type FilingType = 'MD&A' | 'Press Release' | 'Financial Statements' | 'Other';

/**
 * Filing entity
 */
export interface Filing {
  id: string;
  ticker: string;
  company_name: string;
  type: FilingType;
  title: string;
  summary: string;
  date_filed: string;
  is_material: boolean;
  is_read: boolean;
  created_at: string;
}

// =============================================================================
// Executive Types
// =============================================================================

/**
 * Executive tenure risk level
 */
export type TenureRisk = 'Stable' | 'Watch' | 'Flight Risk' | 'Unknown';

/**
 * Executive entity
 */
export interface Executive {
  id: string;
  name: string;
  title: string;
  company: string;
  ticker: string;
  years_at_company: number;
  total_experience_years: number;
  specialization: string;
  tenure_risk: TenureRisk;
  education: string[];
  career_timeline: CareerEntry[];
  social_links?: {
    linkedin?: string;
    twitter?: string;
  };
}

/**
 * Career entry in executive timeline
 */
export interface CareerEntry {
  company: string;
  title: string;
  start_year: number;
  end_year?: number;
}

// =============================================================================
// VETTR Score Types
// =============================================================================

/**
 * Sub-scores for Financial Survival pillar
 */
export interface FinancialSurvivalSubScores {
  cash_runway: number;
  solvency: number;
}

/**
 * Sub-scores for Operational Efficiency pillar
 */
export interface OperationalEfficiencySubScores {
  efficiency_ratio: number;
}

/**
 * Sub-scores for Shareholder Structure pillar
 */
export interface ShareholderStructureSubScores {
  pedigree: number;
  dilution_penalty: number;
  sedi_insider_conviction: number;
  warrant_overhang: number;
  /** @deprecated kept for backward compatibility, use sedi_insider_conviction instead */
  insider_alignment?: number;
}

/**
 * Sub-scores for Market Sentiment pillar
 */
export interface MarketSentimentSubScores {
  liquidity: number;
  news_velocity: number;
  technical_momentum: number;
  short_squeeze: number;
  analyst_consensus: number;
}

/**
 * Pillar component with score, weight, and sub-scores
 */
export interface VetrScorePillar<T> {
  score: number;
  weight: number;
  sub_scores: T;
}

/**
 * VETTR Score with 4-pillar component breakdown
 */
export interface VetrScore {
  ticker: string;
  overall_score: number;
  financial_survival: VetrScorePillar<FinancialSurvivalSubScores>;
  operational_efficiency: VetrScorePillar<OperationalEfficiencySubScores>;
  shareholder_structure: VetrScorePillar<ShareholderStructureSubScores>;
  market_sentiment: VetrScorePillar<MarketSentimentSubScores>;
  null_pillars: string[];
  calculated_at: string;
}

/**
 * VETTR Score history data point
 */
export interface VetrScoreHistoryPoint {
  date: string;
  score: number;
  financial_survival_score?: number;
  operational_efficiency_score?: number;
  shareholder_structure_score?: number;
  market_sentiment_score?: number;
}

/**
 * VETTR Score history response
 */
export interface VetrScoreHistory {
  ticker: string;
  history: VetrScoreHistoryPoint[];
  time_range: string;
}

/**
 * VETTR Score trend analysis
 */
export interface VetrScoreTrend {
  ticker: string;
  direction: 'Improving' | 'Stable' | 'Declining';
  momentum: number;
  recent_changes: {
    date: string;
    change: number;
    reason: string;
  }[];
}

/**
 * VETTR Score comparison with peers
 */
export interface VetrScoreComparison {
  ticker: string;
  score: number;
  sector: string;
  sector_average: number;
  percentile_rank: number;
  peers: {
    ticker: string;
    company_name: string;
    score: number;
  }[];
}

// =============================================================================
// Red Flag Types
// =============================================================================

/**
 * Red flag severity level
 */
export type RedFlagSeverity = 'Low' | 'Moderate' | 'High' | 'Critical';

/**
 * Red flag entity
 */
export interface RedFlag {
  id: string;
  ticker: string;
  name: string;
  explanation: string;
  severity: RedFlagSeverity;
  detected_at: string;
  is_acknowledged: boolean;
}

/**
 * Red flags summary for a stock
 */
export interface RedFlagsResponse {
  ticker: string;
  overall_score: number;
  breakdown: {
    consolidation_velocity: number;
    financing_velocity: number;
    executive_churn: number;
    disclosure_gaps: number;
    debt_trend: number;
  };
  detected_flags: RedFlag[];
}

/**
 * Red flag history entry
 */
export interface RedFlagHistoryEntry {
  id: string;
  flag_name: string;
  severity: RedFlagSeverity;
  detected_at: string;
}

/**
 * Red flag history response
 */
export interface RedFlagHistory {
  ticker: string;
  history: RedFlagHistoryEntry[];
}

/**
 * Global red flag trend data
 */
export interface RedFlagTrend {
  total_active_flags: number;
  change_30_days: number;
  breakdown_by_severity: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
}

// =============================================================================
// Alert Types
// =============================================================================

/**
 * Alert rule type
 */
export type AlertType =
  | 'Red Flag'
  | 'Financing'
  | 'Executive Changes'
  | 'Consolidation'
  | 'Drill Results';

/**
 * Alert frequency
 */
export type AlertFrequency = 'Real-time' | 'Daily' | 'Weekly';

/**
 * Alert rule entity
 */
export interface AlertRule {
  id: string;
  user_id: string;
  ticker: string;
  alert_type: AlertType;
  condition?: Record<string, unknown>;
  frequency: AlertFrequency;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Alert trigger event
 */
export interface AlertTrigger {
  id: string;
  rule_id: string;
  ticker: string;
  alert_type: AlertType;
  message: string;
  triggered_at: string;
  is_read: boolean;
}

// =============================================================================
// Discovery Collections Types
// =============================================================================

/**
 * Stock entity in a discovery collection
 */
export interface CollectionStock {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  market_cap: number | null;
  price: number | null;
  price_change: number | null;
  vetr_score: number | null;
}

/**
 * Discovery collection entity
 */
export interface DiscoveryCollection {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  criteria_summary: string;
  stocks: CollectionStock[];
}

/**
 * Discovery collections response data
 */
export interface DiscoveryCollectionsData {
  collections: DiscoveryCollection[];
}

// =============================================================================
// Sync Types
// =============================================================================

/**
 * Sync pull request
 */
export interface SyncPullRequest {
  last_sync_timestamp?: string;
}

/**
 * Sync pull response
 */
export interface SyncPullResponse {
  watchlist: string[];
  alert_rules: AlertRule[];
  user_settings: UserSettings;
  sync_timestamp: string;
}

/**
 * Sync push request
 */
export interface SyncPushRequest {
  watchlist?: string[];
  alert_rules?: AlertRule[];
  user_settings?: UserSettings;
}

/**
 * Sync push response
 */
export interface SyncPushResponse {
  sync_timestamp: string;
  conflicts: string[];
}

/**
 * Sync conflict resolution request
 */
export interface SyncResolveRequest {
  conflicts: {
    field: string;
    resolution: 'local' | 'remote';
  }[];
}

/**
 * Sync conflict resolution response
 */
export interface SyncResolveResponse {
  sync_timestamp: string;
  resolved: boolean;
}

// =============================================================================
// Pulse Summary Types
// =============================================================================

/**
 * Watchlist health breakdown by VETR score thresholds
 */
export interface WatchlistHealth {
  elite: { count: number; pct: number };
  contender: { count: number; pct: number };
  watchlist: { count: number; pct: number };
  speculative: { count: number; pct: number };
  toxic: { count: number; pct: number };
}

/**
 * Sector exposure item
 */
export interface SectorExposure {
  sector: string;
  exchange: string;
  count: number;
  pct: number;
}

/**
 * Red flag category item
 */
export interface RedFlagCategoryItem {
  category: string;
  label: string;
  stock_count: number;
  severity: 'critical' | 'warning';
}

/**
 * Latest red flag alert
 */
export interface LatestRedFlagAlert {
  ticker: string;
  label: string;
  description: string;
  is_new: boolean;
}

/**
 * Red flag categories summary
 */
export interface RedFlagCategories {
  critical_count: number;
  warning_count: number;
  categories: RedFlagCategoryItem[];
  latest_alert: LatestRedFlagAlert | null;
}

/**
 * Pulse dashboard summary response
 */
export interface PulseSummary {
  watchlist_health: WatchlistHealth;
  sector_exposure: SectorExposure[];
  red_flag_categories: RedFlagCategories;
}

// =============================================================================
// Stock Preview Types (for guest partial view)
// =============================================================================

export interface StockPreviewPillar {
  score: number;
  weight: number;
}

export interface StockPreview {
  ticker: string;
  company_name: string;
  exchange: string;
  sector: string;
  market_cap: number | null;
  current_price: number | null;
  price_change_percent: number | null;
  vetr_score: number | null;
  pillars: {
    financial_survival: StockPreviewPillar;
    operational_efficiency: StockPreviewPillar;
    shareholder_structure: StockPreviewPillar;
    market_sentiment: StockPreviewPillar;
  } | null;
  null_pillars: string[];
}

// =============================================================================
// Sample Portfolio Types
// =============================================================================

export interface SamplePortfolioStock {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  market_cap: number | null;
  price: number | null;
  price_change: number | null;
  vetr_score: number | null;
}

export interface SamplePortfolio {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  criteria_summary: string;
  stock_count: number;
  total_notional_value: number;
  stocks: SamplePortfolioStock[];
}

export interface SamplePortfoliosData {
  portfolios: SamplePortfolio[];
}
