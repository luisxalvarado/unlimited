// ─── CONFIGURATION (Sheet 1: Start Here) ────────────────────
export interface WealthConfig {
  fullName: string;
  taxTargetPct: number;
  savingsTargetPct: number;
  lifestyleTargetMonthly: number;
  hideProfitMargin: boolean;
}

// ─── ASSET LIBRARY (Sheet 3) ─────────────────────────────────
export type AssetCategory =
  | 'Bank Accounts' | 'Investment Accounts' | 'Property' | 'Stocks'
  | 'Art' | 'Businesses' | 'Cash' | 'Clothing' | 'Crypto & NFTs'
  | 'Electronics' | 'Furniture' | 'Jewellery' | 'Personal Items'
  | 'Precious Metals' | 'Vehicles' | 'Other (Liquid)' | 'Other (Non-liquid)';

export interface Asset {
  category: AssetCategory;
  name: string;
  rating: number;
  purchasePrice: number;
  loanBalance: number;
  holdingCostMonthly: number;
  marketValue: number;
  isSold: boolean;
  salePrice?: number;
}

export interface AssetComputed extends Asset {
  netEquity: number;
  profitLoss: number;
  costOfCapital: number;
  trueMonthlyCost: number;
}

export interface AssetCategorySummary {
  category: string;
  marketValue: number;
  loanBalance: number;
  netEquity: number;
}

// ─── INCOME STATEMENT (Sheet 4) ──────────────────────────────
export interface MonthlyIncome {
  month: string;
  otherIncome: number;
  revenue: number;
  refunds: number;
  tax: number;
  savings: number;
  lifestyle: number;
}

export interface IncomeStatementComputed extends MonthlyIncome {
  netIncome: number;
  surplus: number;
  taxTarget: number;
  savingsTarget: number;
  lifestyleTarget: number;
  taxDelta: number | 'Perfect!';
  savingsDelta: number | 'Perfect!';
}

// ─── NET WORTH / BALANCE SHEET (Sheet 5) ─────────────────────
export interface LiabilityEntry {
  name: string;
  amount: number;
}

export interface MonthlyNetWorth {
  month: string;
  assetsByCategory: Record<string, number>;
  totalAssets: number;
  taxOwed: number;
  liabilities: LiabilityEntry[];
  totalLiabilities: number;
  netWorth: number;
}

// ─── PROSPERITY (Sheet 6) ────────────────────────────────────
export interface MonthlyProsperity {
  month: string;
  liquidAssets: number;
  taxOwed: number;
  netLiquidAssets: number;
  livingExpenses: number;
  passiveIncome: number;
  prosperity: string;
  prosperityMonths: number;
}

// ─── SUMMARY / KPIs (Sheet 7) ────────────────────────────────
export interface KPISummary {
  netWorth: number;
  netLiquidAssets: number;
  prosperity: string;
  personalIncome: number;
  personalExpenses: number;
}

// ─── CHART DATA ──────────────────────────────────────────────
export interface RevenueChartPoint {
  label: string;
  revenue: number;
  netIncome: number;
  profitMargin?: number;
}

export interface NetWorthChartPoint {
  label: string;
  netWorth: number;
  netLiquidAssets: number;
}

export interface LifestyleChartPoint {
  label: string;
  expenses: number;
  target: number;
}

// ─── HISTORICAL DATA (Sheet 8: PASTE: Data) ──────────────────
export interface HistoricalDataPoint {
  date: string;
  label: string;
  revenue: number;
  profit: number;
  netWorth: number;
  netLiquidAssets: number;
  livingExpenses: number;
}

// ─── WEALTH COACH ────────────────────────────────────────────
export interface WealthCoachMessage {
  incomeTarget: string | null;
  incomePace: string | null;
  surplusPlan: string | null;
  taxAdvice: string | null;
  savingsAdvice: string | null;
  lifestyleAdvice: string | null;
}

// ─── SELLING PRIORITY ────────────────────────────────────────
export interface SellingPriorityItem {
  name: string;
  value: number;
  type: 'asset' | 'liability';
}

// ─── TOP-LEVEL DATA BUNDLE ────────────────────────────────────
export interface WealthMapData {
  config: WealthConfig;
  assets: Asset[];
  monthlyIncome: MonthlyIncome[];
  liabilities: LiabilityEntry[];
  historicalData: HistoricalDataPoint[];
}

export interface WealthMapComputed {
  config: WealthConfig;
  kpis: KPISummary;
  incomeStatements: IncomeStatementComputed[];
  assetCategories: AssetCategorySummary[];
  assetsComputed: AssetComputed[];
  prosperityData: MonthlyProsperity[];
  revenueChartData: RevenueChartPoint[];
  netWorthChartData: NetWorthChartPoint[];
  lifestyleChartData: LifestyleChartPoint[];
  sellingPriority: SellingPriorityItem[];
  wealthCoach: WealthCoachMessage;
  lowRatedAssets: AssetComputed[];
  debtTip: string;
}
