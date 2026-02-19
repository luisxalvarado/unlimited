import type {
  WealthMapData,
  WealthMapComputed,
  IncomeStatementComputed,
  AssetComputed,
  AssetCategorySummary,
  MonthlyNetWorth,
  MonthlyProsperity,
  KPISummary,
  RevenueChartPoint,
  NetWorthChartPoint,
  LifestyleChartPoint,
  SellingPriorityItem,
} from './types';
import { generateWealthCoach } from './wealthCoach';

const COST_OF_CAPITAL_ANNUAL = 0.08;
const PASSIVE_RETURN_RATE = 0.05;
const AFTER_TAX_FACTOR = 0.7;
const RESERVE_MONTHS = 6;

// Liquid asset categories used for Prosperity / NLA
const LIQUID_CATEGORIES = [
  'Bank Accounts',
  'Investment Accounts',
  'Stocks',
  'Crypto & NFTs',
  'Cash',
  'Precious Metals',
  'Other (Liquid)',
];

export function computeAll(data: WealthMapData): WealthMapComputed {
  const { config, assets, monthlyIncome, liabilities, historicalData } = data;

  // 1. Income Statements
  const incomeStatements = computeIncomeStatements(monthlyIncome, config);

  // 2. Assets
  const assetsComputed = computeAssets(assets);
  const assetCategories = computeAssetCategories(assetsComputed);

  // 3. Net Worth (monthly, derived from income + assets)
  const netWorthSeries = computeNetWorthSeries(incomeStatements, assetCategories, liabilities);

  // 4. Prosperity
  const prosperityData = computeProsperity(netWorthSeries, incomeStatements);

  // 5. KPIs
  const kpis = computeKPIs(netWorthSeries, prosperityData, incomeStatements);

  // 6. Chart data (merge historical + current)
  const revenueChartData = computeRevenueChartData(historicalData, incomeStatements, config);
  const netWorthChartData = computeNetWorthChartData(historicalData, netWorthSeries, prosperityData);
  const lifestyleChartData = computeLifestyleChartData(historicalData, incomeStatements, config);

  // 7. Selling priority
  const sellingPriority = computeSellingPriority(assetCategories, liabilities);

  // 8. Wealth Coach
  const wealthCoach = generateWealthCoach(incomeStatements, config);

  // 9. Low-rated assets (rating 1-3 with true monthly cost)
  const lowRatedAssets = assetsComputed
    .filter(a => a.rating <= 3 && !a.isSold)
    .sort((a, b) => b.trueMonthlyCost - a.trueMonthlyCost);

  // 10. Debt tip
  const debtTip = computeDebtTip(assetsComputed);

  return {
    config,
    kpis,
    incomeStatements,
    assetCategories,
    assetsComputed,
    prosperityData,
    revenueChartData,
    netWorthChartData,
    lifestyleChartData,
    sellingPriority,
    wealthCoach,
    lowRatedAssets,
    debtTip,
  };
}

// ─── INCOME STATEMENTS ───────────────────────────────────────
function computeIncomeStatements(
  months: WealthMapData['monthlyIncome'],
  config: WealthMapData['config']
): IncomeStatementComputed[] {
  return months.map(m => {
    const netIncome = m.revenue - m.refunds + m.otherIncome;
    const surplus = netIncome - m.tax - m.savings - m.lifestyle;
    const taxTarget = config.taxTargetPct;
    const savingsTarget = config.savingsTargetPct;
    const lifestyleTarget = config.lifestyleTargetMonthly;

    const rawTaxDelta = m.tax - (taxTarget * (m.revenue - m.refunds));
    const rawSavDelta = m.savings - (savingsTarget * netIncome);

    const taxDelta: number | 'Perfect!' = Math.round(rawTaxDelta) === 0 ? 'Perfect!' : rawTaxDelta;
    const savingsDelta: number | 'Perfect!' = Math.round(rawSavDelta) === 0 ? 'Perfect!' : rawSavDelta;

    return {
      ...m,
      netIncome,
      surplus,
      taxTarget,
      savingsTarget,
      lifestyleTarget,
      taxDelta,
      savingsDelta,
    };
  });
}

// ─── ASSETS ──────────────────────────────────────────────────
function computeAssets(assets: WealthMapData['assets']): AssetComputed[] {
  return assets.map(a => {
    const netEquity = a.isSold ? 0 : a.marketValue - a.loanBalance;
    const profitLoss = a.isSold
      ? (a.salePrice ?? a.marketValue) - a.purchasePrice
      : a.marketValue - a.purchasePrice;
    const costOfCapital = netEquity > 0 ? (netEquity * COST_OF_CAPITAL_ANNUAL) / 12 : 0;
    const trueMonthlyCost = a.holdingCostMonthly + costOfCapital;

    return { ...a, netEquity, profitLoss, costOfCapital, trueMonthlyCost };
  });
}

// ─── ASSET CATEGORIES ────────────────────────────────────────
function computeAssetCategories(assets: AssetComputed[]): AssetCategorySummary[] {
  const map = new Map<string, AssetCategorySummary>();

  for (const a of assets) {
    if (a.isSold) continue;
    const existing = map.get(a.category);
    if (existing) {
      existing.marketValue += a.marketValue;
      existing.loanBalance += a.loanBalance;
      existing.netEquity += a.netEquity;
    } else {
      map.set(a.category, {
        category: a.category,
        marketValue: a.marketValue,
        loanBalance: a.loanBalance,
        netEquity: a.netEquity,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.marketValue - a.marketValue);
}

// ─── NET WORTH SERIES ────────────────────────────────────────
function computeNetWorthSeries(
  incomes: IncomeStatementComputed[],
  categories: AssetCategorySummary[],
  liabilities: WealthMapData['liabilities']
): MonthlyNetWorth[] {
  const totalAssets = categories.reduce((sum, c) => sum + c.marketValue, 0);
  const totalLoanLiabilities = categories.reduce((sum, c) => sum + c.loanBalance, 0);
  const totalOtherLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);

  const assetsByCategory: Record<string, number> = {};
  for (const c of categories) {
    assetsByCategory[c.category] = c.marketValue;
  }

  return incomes.map(inc => {
    const taxDeltaNum = typeof inc.taxDelta === 'number' ? inc.taxDelta : 0;
    const taxOwed = inc.tax - taxDeltaNum;
    const totalLiabilities = totalLoanLiabilities + totalOtherLiabilities + taxOwed;
    const netWorth = totalAssets - totalLiabilities;

    return {
      month: inc.month,
      assetsByCategory,
      totalAssets,
      taxOwed,
      liabilities,
      totalLiabilities,
      netWorth,
    };
  });
}

// ─── PROSPERITY ──────────────────────────────────────────────
function computeProsperity(
  netWorthSeries: MonthlyNetWorth[],
  incomes: IncomeStatementComputed[]
): MonthlyProsperity[] {
  const categories = Object.entries(netWorthSeries[0]?.assetsByCategory ?? {});
  const liquidTotal = categories
    .filter(([cat]) => LIQUID_CATEGORIES.includes(cat))
    .reduce((sum, [, val]) => sum + val, 0);

  return incomes.map((inc, i) => {
    const nw = netWorthSeries[i];
    const taxOwed = nw?.taxOwed ?? 0;
    const netLiquidAssets = liquidTotal - taxOwed;
    const livingExpenses = inc.lifestyle;

    // Passive Income = (NLA - 6mo reserve) * 5% / 12 * 0.7
    const investable = netLiquidAssets - (livingExpenses * RESERVE_MONTHS);
    const passiveIncome = Math.max(0, investable * PASSIVE_RETURN_RATE / 12 * AFTER_TAX_FACTOR);

    const netBurn = livingExpenses - passiveIncome;
    let prosperityMonths: number;
    let prosperity: string;

    if (livingExpenses <= 0 || netBurn <= 0) {
      prosperityMonths = 99999;
      prosperity = 'Infinite Prosperity';
    } else {
      prosperityMonths = netLiquidAssets / netBurn;
      if (prosperityMonths >= 24) {
        prosperity = (prosperityMonths / 12).toFixed(1) + ' Years';
      } else {
        prosperity = prosperityMonths.toFixed(1) + ' Months';
      }
    }

    return {
      month: inc.month,
      liquidAssets: liquidTotal,
      taxOwed,
      netLiquidAssets,
      livingExpenses,
      passiveIncome,
      prosperity,
      prosperityMonths,
    };
  });
}

// ─── KPIs ────────────────────────────────────────────────────
function computeKPIs(
  netWorthSeries: MonthlyNetWorth[],
  prosperityData: MonthlyProsperity[],
  incomes: IncomeStatementComputed[]
): KPISummary {
  // Net Worth: latest value
  const lastNW = netWorthSeries[netWorthSeries.length - 1];
  const netWorth = lastNW?.netWorth ?? 0;

  // NLA: latest value
  const lastP = prosperityData[prosperityData.length - 1];
  const netLiquidAssets = lastP?.netLiquidAssets ?? 0;

  // Prosperity: compute using Summary D3 formula
  const livingExp = lastP?.livingExpenses ?? 0;
  const investable = netLiquidAssets - (livingExp * RESERVE_MONTHS);
  const passiveInc = Math.max(0, investable * PASSIVE_RETURN_RATE * AFTER_TAX_FACTOR / 12);
  const netBurn = livingExp - passiveInc;
  let prosperity: string;
  if (livingExp <= 0 || netBurn <= 0) {
    prosperity = 'Infinite Prosperity';
  } else {
    const months = netLiquidAssets / netBurn;
    prosperity = months >= 24
      ? (months / 12).toFixed(1) + ' Years'
      : months.toFixed(1) + ' Months';
  }

  // Personal Income: avg of (netIncome - tax + taxDelta adjustment)
  const personalIncomes = incomes.map(inc => {
    const taxDeltaNum = typeof inc.taxDelta === 'number' ? inc.taxDelta : 0;
    return inc.netIncome - inc.tax + taxDeltaNum;
  });
  const personalIncome = personalIncomes.length > 0
    ? personalIncomes.reduce((a, b) => a + b, 0) / personalIncomes.length
    : 0;

  // Personal Expenses: average of last 6 (or all) lifestyle entries
  const lifestyles = incomes.map(i => i.lifestyle);
  const k = Math.min(6, lifestyles.length);
  const lastK = lifestyles.slice(-k);
  const personalExpenses = lastK.length > 0
    ? lastK.reduce((a, b) => a + b, 0) / lastK.length
    : 0;

  return { netWorth, netLiquidAssets, prosperity, personalIncome, personalExpenses };
}

// ─── CHART DATA ──────────────────────────────────────────────
function computeRevenueChartData(
  historical: WealthMapData['historicalData'],
  incomes: IncomeStatementComputed[],
  config: WealthMapData['config']
): RevenueChartPoint[] {
  const histPoints: RevenueChartPoint[] = historical.map(h => ({
    label: h.label,
    revenue: h.revenue,
    netIncome: h.profit,
    profitMargin: config.hideProfitMargin ? undefined : (h.revenue > 0 ? h.profit / h.revenue : undefined),
  }));

  const currentPoints: RevenueChartPoint[] = incomes.map(inc => ({
    label: inc.month + ' 26',
    revenue: inc.revenue,
    netIncome: inc.netIncome,
    profitMargin: config.hideProfitMargin ? undefined : (inc.revenue > 0 ? inc.netIncome / inc.revenue : undefined),
  }));

  return [...histPoints, ...currentPoints];
}

function computeNetWorthChartData(
  historical: WealthMapData['historicalData'],
  netWorthSeries: MonthlyNetWorth[],
  prosperityData: MonthlyProsperity[]
): NetWorthChartPoint[] {
  const histPoints: NetWorthChartPoint[] = historical.map(h => ({
    label: h.label,
    netWorth: h.netWorth,
    netLiquidAssets: h.netLiquidAssets,
  }));

  const currentPoints: NetWorthChartPoint[] = netWorthSeries.map((nw, i) => ({
    label: nw.month + ' 26',
    netWorth: nw.netWorth,
    netLiquidAssets: prosperityData[i]?.netLiquidAssets ?? 0,
  }));

  return [...histPoints, ...currentPoints];
}

function computeLifestyleChartData(
  historical: WealthMapData['historicalData'],
  incomes: IncomeStatementComputed[],
  config: WealthMapData['config']
): LifestyleChartPoint[] {
  const histPoints: LifestyleChartPoint[] = historical.map(h => ({
    label: h.label,
    expenses: h.livingExpenses,
    target: config.lifestyleTargetMonthly,
  }));

  const currentPoints: LifestyleChartPoint[] = incomes.map(inc => ({
    label: inc.month + ' 26',
    expenses: inc.lifestyle,
    target: config.lifestyleTargetMonthly,
  }));

  return [...histPoints, ...currentPoints];
}

// ─── SELLING PRIORITY ────────────────────────────────────────
function computeSellingPriority(
  categories: AssetCategorySummary[],
  liabilities: WealthMapData['liabilities']
): SellingPriorityItem[] {
  const assetItems: SellingPriorityItem[] = categories
    .filter(c => c.marketValue > 0)
    .sort((a, b) => b.marketValue - a.marketValue)
    .map(c => ({ name: c.category, value: c.marketValue, type: 'asset' as const }));

  const liabItems: SellingPriorityItem[] = liabilities
    .filter(l => l.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map(l => ({ name: l.name, value: -l.amount, type: 'liability' as const }));

  return [...assetItems, ...liabItems];
}

// ─── DEBT TIP ────────────────────────────────────────────────
function computeDebtTip(assets: AssetComputed[]): string {
  const debts = assets
    .filter(a => a.loanBalance > 0 && !a.isSold)
    .sort((a, b) => b.loanBalance - a.loanBalance);

  if (debts.length === 0) {
    return "No loans or debts logged! If that's correct, congrats. If you do have any, add them in your Library.";
  }

  const parts = debts.map(d =>
    d.name + ' ($' + d.loanBalance.toLocaleString('en-US') + ')'
  );

  return "Don't forget to log the debt on your " + parts.join(' and your ') + '.';
}
