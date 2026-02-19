import type { WealthMapData } from './types';

export const sampleData: WealthMapData = {
  config: {
    fullName: 'Luis Alvarado',
    taxTargetPct: 0.30,
    savingsTargetPct: 0.20,
    lifestyleTargetMonthly: 20000,
    hideProfitMargin: false,
  },

  historicalData: [
    { date: '2025-07-01', label: 'Jul 25', revenue: 38000, profit: 28500, netWorth: 185000, netLiquidAssets: 120000, livingExpenses: 17500 },
    { date: '2025-08-01', label: 'Aug 25', revenue: 42000, profit: 32000, netWorth: 195000, netLiquidAssets: 128000, livingExpenses: 18200 },
    { date: '2025-09-01', label: 'Sep 25', revenue: 35000, profit: 25500, netWorth: 190000, netLiquidAssets: 124000, livingExpenses: 19100 },
    { date: '2025-10-01', label: 'Oct 25', revenue: 48000, profit: 38000, netWorth: 210000, netLiquidAssets: 140000, livingExpenses: 18800 },
    { date: '2025-11-01', label: 'Nov 25', revenue: 52000, profit: 41000, netWorth: 225000, netLiquidAssets: 155000, livingExpenses: 19500 },
    { date: '2025-12-01', label: 'Dec 25', revenue: 45000, profit: 34500, netWorth: 235000, netLiquidAssets: 162000, livingExpenses: 20200 },
  ],

  monthlyIncome: [
    { month: 'Jan', otherIncome: 1200, revenue: 50000, refunds: 500, tax: 14500, savings: 10000, lifestyle: 19500 },
    { month: 'Feb', otherIncome: 800, revenue: 55000, refunds: 1200, tax: 16000, savings: 10500, lifestyle: 21200 },
    { month: 'Mar', otherIncome: 1500, revenue: 47000, refunds: 300, tax: 14000, savings: 9500, lifestyle: 18800 },
    { month: 'Apr', otherIncome: 2000, revenue: 60000, refunds: 800, tax: 18500, savings: 12000, lifestyle: 22000 },
  ],

  assets: [
    { category: 'Bank Accounts', name: 'Chase Checking', rating: 5, purchasePrice: 0, loanBalance: 0, holdingCostMonthly: 0, marketValue: 45000, isSold: false },
    { category: 'Bank Accounts', name: 'Ally Savings', rating: 5, purchasePrice: 0, loanBalance: 0, holdingCostMonthly: 0, marketValue: 82000, isSold: false },
    { category: 'Investment Accounts', name: 'Fidelity Brokerage', rating: 4, purchasePrice: 60000, loanBalance: 0, holdingCostMonthly: 0, marketValue: 95000, isSold: false },
    { category: 'Crypto & NFTs', name: 'Bitcoin', rating: 3, purchasePrice: 15000, loanBalance: 0, holdingCostMonthly: 0, marketValue: 28000, isSold: false },
    { category: 'Vehicles', name: '2022 Tesla Model 3', rating: 2, purchasePrice: 48000, loanBalance: 18000, holdingCostMonthly: 450, marketValue: 32000, isSold: false },
    { category: 'Electronics', name: 'Studio Equipment', rating: 3, purchasePrice: 8000, loanBalance: 0, holdingCostMonthly: 25, marketValue: 5000, isSold: false },
    { category: 'Property', name: 'Investment Condo', rating: 4, purchasePrice: 180000, loanBalance: 120000, holdingCostMonthly: 1800, marketValue: 220000, isSold: false },
    { category: 'Stocks', name: 'AAPL Shares', rating: 4, purchasePrice: 12000, loanBalance: 0, holdingCostMonthly: 0, marketValue: 18500, isSold: false },
  ],

  liabilities: [
    { name: 'Student Loan', amount: 15000 },
    { name: 'Credit Card', amount: 3200 },
  ],
};
