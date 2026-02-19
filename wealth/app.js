(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // 1. SAMPLE DATA
  // ═══════════════════════════════════════════════════════════

  var sampleData = {
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

  // ═══════════════════════════════════════════════════════════
  // 2. FORMATTERS
  // ═══════════════════════════════════════════════════════════

  function formatCurrency(value) {
    var abs = Math.abs(value);
    var formatted = abs >= 1000
      ? '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : '$' + abs.toFixed(0);
    return value < 0 ? '-' + formatted : formatted;
  }

  function formatCurrencyCompact(value) {
    var abs = Math.abs(value);
    var formatted;
    if (abs >= 1000000) {
      formatted = '$' + (abs / 1000000).toFixed(1) + 'M';
    } else if (abs >= 1000) {
      formatted = '$' + (abs / 1000).toFixed(0) + 'K';
    } else {
      formatted = '$' + abs.toFixed(0);
    }
    return value < 0 ? '-' + formatted : formatted;
  }

  function formatMonths(value) {
    if (value >= 9999) return 'Infinite Prosperity';
    if (value >= 24) return (value / 12).toFixed(1) + ' Years';
    return value.toFixed(1) + ' Months';
  }

  // ═══════════════════════════════════════════════════════════
  // 3. CALCULATIONS
  // ═══════════════════════════════════════════════════════════

  var COST_OF_CAPITAL_ANNUAL = 0.08;
  var PASSIVE_RETURN_RATE = 0.05;
  var AFTER_TAX_FACTOR = 0.7;
  var RESERVE_MONTHS = 6;

  var LIQUID_CATEGORIES = [
    'Bank Accounts', 'Investment Accounts', 'Stocks',
    'Crypto & NFTs', 'Cash', 'Precious Metals', 'Other (Liquid)',
  ];

  function computeAll(data) {
    var config = data.config;
    var assets = data.assets;
    var monthlyIncome = data.monthlyIncome;
    var liabilities = data.liabilities;
    var historicalData = data.historicalData;

    var incomeStatements = computeIncomeStatements(monthlyIncome, config);
    var assetsComputed = computeAssets(assets);
    var assetCategories = computeAssetCategories(assetsComputed);
    var netWorthSeries = computeNetWorthSeries(incomeStatements, assetCategories, liabilities);
    var prosperityData = computeProsperity(netWorthSeries, incomeStatements);
    var kpis = computeKPIs(netWorthSeries, prosperityData, incomeStatements);
    var revenueChartData = computeRevenueChartData(historicalData, incomeStatements, config);
    var netWorthChartData = computeNetWorthChartData(historicalData, netWorthSeries, prosperityData);
    var lifestyleChartData = computeLifestyleChartData(historicalData, incomeStatements, config);
    var sellingPriority = computeSellingPriority(assetCategories, liabilities);
    var wealthCoach = generateWealthCoach(incomeStatements, config);
    var lowRatedAssets = assetsComputed
      .filter(function (a) { return a.rating <= 3 && !a.isSold; })
      .sort(function (a, b) { return b.trueMonthlyCost - a.trueMonthlyCost; });
    var debtTip = computeDebtTip(assetsComputed);

    return {
      config: config,
      kpis: kpis,
      incomeStatements: incomeStatements,
      assetCategories: assetCategories,
      assetsComputed: assetsComputed,
      prosperityData: prosperityData,
      revenueChartData: revenueChartData,
      netWorthChartData: netWorthChartData,
      lifestyleChartData: lifestyleChartData,
      sellingPriority: sellingPriority,
      wealthCoach: wealthCoach,
      lowRatedAssets: lowRatedAssets,
      debtTip: debtTip,
    };
  }

  function computeIncomeStatements(months, config) {
    return months.map(function (m) {
      var netIncome = m.revenue - m.refunds + m.otherIncome;
      var surplus = netIncome - m.tax - m.savings - m.lifestyle;
      var taxTarget = config.taxTargetPct;
      var savingsTarget = config.savingsTargetPct;
      var lifestyleTarget = config.lifestyleTargetMonthly;

      var rawTaxDelta = m.tax - (taxTarget * (m.revenue - m.refunds));
      var rawSavDelta = m.savings - (savingsTarget * netIncome);

      var taxDelta = Math.round(rawTaxDelta) === 0 ? 'Perfect!' : rawTaxDelta;
      var savingsDelta = Math.round(rawSavDelta) === 0 ? 'Perfect!' : rawSavDelta;

      return {
        month: m.month,
        otherIncome: m.otherIncome,
        revenue: m.revenue,
        refunds: m.refunds,
        tax: m.tax,
        savings: m.savings,
        lifestyle: m.lifestyle,
        netIncome: netIncome,
        surplus: surplus,
        taxTarget: taxTarget,
        savingsTarget: savingsTarget,
        lifestyleTarget: lifestyleTarget,
        taxDelta: taxDelta,
        savingsDelta: savingsDelta,
      };
    });
  }

  function computeAssets(assets) {
    return assets.map(function (a) {
      var netEquity = a.isSold ? 0 : a.marketValue - a.loanBalance;
      var profitLoss = a.isSold
        ? (a.salePrice || a.marketValue) - a.purchasePrice
        : a.marketValue - a.purchasePrice;
      var costOfCapital = netEquity > 0 ? (netEquity * COST_OF_CAPITAL_ANNUAL) / 12 : 0;
      var trueMonthlyCost = a.holdingCostMonthly + costOfCapital;

      return Object.assign({}, a, {
        netEquity: netEquity,
        profitLoss: profitLoss,
        costOfCapital: costOfCapital,
        trueMonthlyCost: trueMonthlyCost,
      });
    });
  }

  function computeAssetCategories(assets) {
    var map = {};
    assets.forEach(function (a) {
      if (a.isSold) return;
      if (map[a.category]) {
        map[a.category].marketValue += a.marketValue;
        map[a.category].loanBalance += a.loanBalance;
        map[a.category].netEquity += a.netEquity;
      } else {
        map[a.category] = {
          category: a.category,
          marketValue: a.marketValue,
          loanBalance: a.loanBalance,
          netEquity: a.netEquity,
        };
      }
    });
    return Object.values(map).sort(function (a, b) { return b.marketValue - a.marketValue; });
  }

  function computeNetWorthSeries(incomes, categories, liabilities) {
    var totalAssets = categories.reduce(function (s, c) { return s + c.marketValue; }, 0);
    var totalLoanLiabilities = categories.reduce(function (s, c) { return s + c.loanBalance; }, 0);
    var totalOtherLiabilities = liabilities.reduce(function (s, l) { return s + l.amount; }, 0);

    var assetsByCategory = {};
    categories.forEach(function (c) { assetsByCategory[c.category] = c.marketValue; });

    return incomes.map(function (inc) {
      var taxDeltaNum = typeof inc.taxDelta === 'number' ? inc.taxDelta : 0;
      var taxOwed = inc.tax - taxDeltaNum;
      var totalLiabilities = totalLoanLiabilities + totalOtherLiabilities + taxOwed;
      var netWorth = totalAssets - totalLiabilities;

      return {
        month: inc.month,
        assetsByCategory: assetsByCategory,
        totalAssets: totalAssets,
        taxOwed: taxOwed,
        liabilities: liabilities,
        totalLiabilities: totalLiabilities,
        netWorth: netWorth,
      };
    });
  }

  function computeProsperity(netWorthSeries, incomes) {
    var firstNW = netWorthSeries[0];
    var entries = firstNW ? Object.entries(firstNW.assetsByCategory) : [];
    var liquidTotal = entries
      .filter(function (e) { return LIQUID_CATEGORIES.indexOf(e[0]) !== -1; })
      .reduce(function (sum, e) { return sum + e[1]; }, 0);

    return incomes.map(function (inc, i) {
      var nw = netWorthSeries[i];
      var taxOwed = nw ? nw.taxOwed : 0;
      var netLiquidAssets = liquidTotal - taxOwed;
      var livingExpenses = inc.lifestyle;

      var investable = netLiquidAssets - (livingExpenses * RESERVE_MONTHS);
      var passiveIncome = Math.max(0, investable * PASSIVE_RETURN_RATE / 12 * AFTER_TAX_FACTOR);

      var netBurn = livingExpenses - passiveIncome;
      var prosperityMonths, prosperity;

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
        taxOwed: taxOwed,
        netLiquidAssets: netLiquidAssets,
        livingExpenses: livingExpenses,
        passiveIncome: passiveIncome,
        prosperity: prosperity,
        prosperityMonths: prosperityMonths,
      };
    });
  }

  function computeKPIs(netWorthSeries, prosperityData, incomes) {
    var lastNW = netWorthSeries[netWorthSeries.length - 1];
    var netWorth = lastNW ? lastNW.netWorth : 0;

    var lastP = prosperityData[prosperityData.length - 1];
    var netLiquidAssets = lastP ? lastP.netLiquidAssets : 0;

    var livingExp = lastP ? lastP.livingExpenses : 0;
    var investable = netLiquidAssets - (livingExp * RESERVE_MONTHS);
    var passiveInc = Math.max(0, investable * PASSIVE_RETURN_RATE * AFTER_TAX_FACTOR / 12);
    var netBurn = livingExp - passiveInc;
    var prosperity;
    if (livingExp <= 0 || netBurn <= 0) {
      prosperity = 'Infinite Prosperity';
    } else {
      var months = netLiquidAssets / netBurn;
      prosperity = months >= 24
        ? (months / 12).toFixed(1) + ' Years'
        : months.toFixed(1) + ' Months';
    }

    var personalIncomes = incomes.map(function (inc) {
      var taxDeltaNum = typeof inc.taxDelta === 'number' ? inc.taxDelta : 0;
      return inc.netIncome - inc.tax + taxDeltaNum;
    });
    var personalIncome = personalIncomes.length > 0
      ? personalIncomes.reduce(function (a, b) { return a + b; }, 0) / personalIncomes.length
      : 0;

    var lifestyles = incomes.map(function (i) { return i.lifestyle; });
    var k = Math.min(6, lifestyles.length);
    var lastK = lifestyles.slice(-k);
    var personalExpenses = lastK.length > 0
      ? lastK.reduce(function (a, b) { return a + b; }, 0) / lastK.length
      : 0;

    return {
      netWorth: netWorth,
      netLiquidAssets: netLiquidAssets,
      prosperity: prosperity,
      personalIncome: personalIncome,
      personalExpenses: personalExpenses,
    };
  }

  function computeRevenueChartData(historical, incomes, config) {
    var histPoints = historical.map(function (h) {
      return { label: h.label, revenue: h.revenue, netIncome: h.profit };
    });
    var currentPoints = incomes.map(function (inc) {
      return { label: inc.month + ' 26', revenue: inc.revenue, netIncome: inc.netIncome };
    });
    return histPoints.concat(currentPoints);
  }

  function computeNetWorthChartData(historical, netWorthSeries, prosperityData) {
    var histPoints = historical.map(function (h) {
      return { label: h.label, netWorth: h.netWorth, netLiquidAssets: h.netLiquidAssets };
    });
    var currentPoints = netWorthSeries.map(function (nw, i) {
      return {
        label: nw.month + ' 26',
        netWorth: nw.netWorth,
        netLiquidAssets: prosperityData[i] ? prosperityData[i].netLiquidAssets : 0,
      };
    });
    return histPoints.concat(currentPoints);
  }

  function computeLifestyleChartData(historical, incomes, config) {
    var histPoints = historical.map(function (h) {
      return { label: h.label, expenses: h.livingExpenses, target: config.lifestyleTargetMonthly };
    });
    var currentPoints = incomes.map(function (inc) {
      return { label: inc.month + ' 26', expenses: inc.lifestyle, target: config.lifestyleTargetMonthly };
    });
    return histPoints.concat(currentPoints);
  }

  function computeSellingPriority(categories, liabilities) {
    var assetItems = categories
      .filter(function (c) { return c.marketValue > 0; })
      .sort(function (a, b) { return b.marketValue - a.marketValue; })
      .map(function (c) { return { name: c.category, value: c.marketValue, type: 'asset' }; });

    var liabItems = liabilities
      .filter(function (l) { return l.amount > 0; })
      .sort(function (a, b) { return b.amount - a.amount; })
      .map(function (l) { return { name: l.name, value: -l.amount, type: 'liability' }; });

    return assetItems.concat(liabItems);
  }

  function computeDebtTip(assets) {
    var debts = assets
      .filter(function (a) { return a.loanBalance > 0 && !a.isSold; })
      .sort(function (a, b) { return b.loanBalance - a.loanBalance; });

    if (debts.length === 0) {
      return "No loans or debts logged! If that's correct, congrats. If you do have any, add them in your Library.";
    }

    var parts = debts.map(function (d) {
      return d.name + ' ($' + d.loanBalance.toLocaleString('en-US') + ')';
    });
    return "Don't forget to log the debt on your " + parts.join(' and your ') + '.';
  }

  // ═══════════════════════════════════════════════════════════
  // 4. WEALTH COACH
  // ═══════════════════════════════════════════════════════════

  function generateWealthCoach(incomes, config) {
    if (incomes.length === 0) {
      return { incomeTarget: null, incomePace: null, surplusPlan: null, taxAdvice: null, savingsAdvice: null, lifestyleAdvice: null };
    }

    var surplusTotal = incomes.reduce(function (sum, i) { return sum + i.surplus; }, 0);
    var taxDeltaTotal = incomes.reduce(function (sum, i) {
      return sum + (typeof i.taxDelta === 'number' ? i.taxDelta : 0);
    }, 0);
    var savDeltaTotal = incomes.reduce(function (sum, i) {
      return sum + (typeof i.savingsDelta === 'number' ? i.savingsDelta : 0);
    }, 0);

    var months = incomes.length;
    var lifeTotal = incomes.reduce(function (sum, i) { return sum + i.lifestyle; }, 0);
    var lifeAvg = months > 0 ? lifeTotal / months : 0;

    var lastIncome = incomes[incomes.length - 1];
    var lastLifeGoal = lastIncome.lifestyleTarget;
    var taxRate = lastIncome.taxTarget;
    var savRate = lastIncome.savingsTarget;

    var netTotal = incomes.reduce(function (sum, i) { return sum + i.netIncome; }, 0);
    var netAvg = months > 0 ? netTotal / months : 0;

    var capRate = 1 - (taxRate + savRate);
    var reqNetPM = capRate > 0 && lastLifeGoal > 0 ? lastLifeGoal / capRate : null;
    var gapNetPM = reqNetPM !== null ? reqNetPM - netAvg : null;

    var taxShort = Math.max(0, -taxDeltaTotal);
    var savShort = Math.max(0, -savDeltaTotal);

    var surplus = surplusTotal;
    var useSurpTax = surplus > 0 ? Math.min(surplus, taxShort) : 0;
    var surpAfterTax = surplus > 0 ? surplus - useSurpTax : 0;
    var useSurpSav = surpAfterTax > 0 ? Math.min(surpAfterTax, savShort) : 0;

    var taxRem1 = Math.max(0, taxShort - useSurpTax);
    var savRem1 = Math.max(0, savShort - useSurpSav);

    var savAhead = Math.max(0, savDeltaTotal);
    var taxAhead = Math.max(0, taxDeltaTotal);

    var shiftSavToTax = taxRem1 > 0 ? Math.min(savAhead, taxRem1) : 0;
    var shiftTaxToSav = savRem1 > 0 ? Math.min(taxAhead, savRem1) : 0;

    var taxRem = Math.max(0, taxRem1 - shiftSavToTax);
    var savRem = Math.max(0, savRem1 - shiftTaxToSav);

    var taxActions = [];
    if (useSurpTax > 0) taxActions.push('Use ' + cfmt(useSurpTax) + ' of surplus to top it up.');
    if (shiftSavToTax > 0) taxActions.push('Shift ' + cfmt(shiftSavToTax) + ' from your savings -> tax.');

    var savActions = [];
    if (useSurpSav > 0) savActions.push('Use ' + cfmt(useSurpSav) + ' of surplus to top it up.');
    if (shiftTaxToSav > 0) savActions.push('Shift ' + cfmt(shiftTaxToSav) + ' from your tax -> savings.');

    // MESSAGE 1: Income Target
    var incomeTarget = null;
    if (reqNetPM !== null) {
      incomeTarget = 'Net income target: To spend ' + cfmt(lastLifeGoal) + '/mo on lifestyle while allocating ' +
        cpct(taxRate) + ' to tax and ' + cpct(savRate) + ' to savings, you need net income of ~' + cfmt(reqNetPM) + '/mo.';
    } else if (lastLifeGoal > 0) {
      incomeTarget = 'Net income target: Add your Tax% and Savings% so I can calculate the net income needed to fund your lifestyle goal.';
    }

    // MESSAGE 2: Income Pace
    var incomePace = null;
    if (reqNetPM !== null && gapNetPM !== null) {
      if (gapNetPM > 0) {
        incomePace = 'Current pace: Averaging ' + cfmt(netAvg) + '/mo net income \u2014 short by ' + cfmt(gapNetPM) + '/mo.';
      } else {
        incomePace = 'Current pace: Averaging ' + cfmt(netAvg) + '/mo net income \u2014 on track.';
      }
    }

    // MESSAGE 3: Surplus Plan
    var surplusPlan = null;
    if (surplus > 0) {
      if (taxShort + savShort > 0) {
        var msg = 'Surplus: You\'ve got ' + cfmt(surplus) + '. Cover Tax/Savings shortfalls first \u2014 don\'t let this quietly turn into lifestyle creep.';
        if (useSurpTax > 0) msg += ' Tax +' + cfmt(useSurpTax) + '.';
        if (useSurpSav > 0) msg += ' Savings +' + cfmt(useSurpSav) + '.';
        var remaining = surpAfterTax - useSurpSav;
        if (remaining > 0) msg += ' Remaining ' + cfmt(remaining) + '? Allocate it intentionally (investing beats mystery spending).';
        surplusPlan = msg;
      } else {
        surplusPlan = 'Surplus: ' + cfmt(surplus) + '. Nice \u2014 assign it on purpose (invest > accidental spending).';
      }
    } else if (surplus < 0) {
      surplusPlan = 'Surplus: You\'re in the red by ' + cfmt(-surplus) + '. You\'ve allocated more than you earned. Pull lifestyle back or increase income until you\'re back at $0.';
    } else {
      surplusPlan = 'Surplus: Exactly $0. Clean. Perfect.';
    }

    // MESSAGE 4: Tax Advice
    var taxAdvice = null;
    if (taxDeltaTotal < 0) {
      var msg2 = 'Tax: Short ' + cfmt(-taxDeltaTotal) + '.';
      if (useSurpTax > 0 || shiftSavToTax > 0) {
        msg2 += ' ' + taxActions.join(' ');
        if (taxRem > 0) {
          msg2 += ' Even after those moves, you\'re still short ' + cfmt(taxRem) + ' \u2014 fix it by earning more or trimming allocations (start with lifestyle).';
        } else {
          msg2 += ' Back on target.';
        }
      } else {
        msg2 += ' There isn\'t any surplus or savings available to reallocate right now \u2014 fix it by earning more or trimming allocations (start with lifestyle).';
      }
      taxAdvice = msg2;
    } else if (taxDeltaTotal > 0) {
      taxAdvice = 'Tax: Ahead by ' + cfmt(taxDeltaTotal) + '. Keep some buffer (a future tax bill won\'t be impressed by optimism).';
    } else {
      taxAdvice = 'Tax: On target.';
    }

    // MESSAGE 5: Savings Advice
    var savingsAdvice = null;
    if (savDeltaTotal < 0) {
      var msg3 = 'Savings: Short ' + cfmt(-savDeltaTotal) + '.';
      if (useSurpSav > 0 || shiftTaxToSav > 0) {
        msg3 += ' ' + savActions.join(' ');
        if (savRem > 0) {
          msg3 += ' Even after those moves, you\'re still short ' + cfmt(savRem) + ' \u2014 fix it by earning more or trimming allocations (start with lifestyle).';
        } else {
          msg3 += ' Back on target.';
        }
      } else {
        msg3 += ' There isn\'t any surplus or tax available to reallocate right now \u2014 fix it by earning more or trimming allocations (start with lifestyle).';
      }
      savingsAdvice = msg3;
    } else if (savDeltaTotal > 0) {
      savingsAdvice = 'Savings: Ahead by ' + cfmt(savDeltaTotal) + '. That\'s how freedom compounds.';
    } else {
      savingsAdvice = 'Savings: On target.';
    }

    // MESSAGE 6: Lifestyle Advice
    var lifestyleAdvice = null;
    if (months > 0 && lastLifeGoal > 0) {
      var msg4 = 'Lifestyle (per month): Allocated ' + cfmt(lifeTotal) + ' across ' + months + ' month(s) = ' + cfmt(lifeAvg) + '/mo. Latest goal: ' + cfmt(lastLifeGoal) + '/mo. ';
      if (lifeAvg < lastLifeGoal) {
        msg4 += 'Under by ' + cfmt(lastLifeGoal - lifeAvg) + '/mo.';
      } else if (lifeAvg > lastLifeGoal) {
        msg4 += 'Over by ' + cfmt(lifeAvg - lastLifeGoal) + '/mo. If that\'s intentional, fine \u2014 if not, rein it in.';
      } else {
        msg4 += 'Right on the goal.';
      }
      lifestyleAdvice = msg4;
    }

    return {
      incomeTarget: incomeTarget,
      incomePace: incomePace,
      surplusPlan: surplusPlan,
      taxAdvice: taxAdvice,
      savingsAdvice: savingsAdvice,
      lifestyleAdvice: lifestyleAdvice,
    };
  }

  function cfmt(n) {
    return '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
  }

  function cpct(n) {
    return Math.round(n * 100) + '%';
  }

  // ═══════════════════════════════════════════════════════════
  // 5. RENDERERS
  // ═══════════════════════════════════════════════════════════

  function renderHeader(data) {
    var el = document.getElementById('header');
    var parts = data.config.fullName.split(' ');
    var firstName = parts[0];
    var lastName = parts.slice(1).join(' ');
    var dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    el.innerHTML =
      '<div class="header-left">' +
        '<div class="header-label">Wealth Intelligence</div>' +
        '<h1>' + firstName + ' <span>' + lastName + '</span></h1>' +
      '</div>' +
      '<div class="header-right">' +
        '<div class="header-date">' + dateStr + '</div>' +
        '<div class="panel-badge">PERSONAL WEALTH MAP V3.2.2</div>' +
      '</div>';
  }

  function renderStatusRow(data) {
    var el = document.getElementById('status-row');
    var k = data.kpis;

    function card(label, value, unit, context, ac, cc) {
      return '<div class="stat" style="--ac:' + ac + '">' +
        '<div class="stat-label">' + label + '</div>' +
        '<div class="stat-value">' + value + '</div>' +
        (unit ? '<div class="stat-unit">' + unit + '</div>' : '') +
        (context ? '<div class="stat-context" style="color:' + cc + '">' + context + '</div>' : '') +
      '</div>';
    }

    var prosCC = k.prosperity.indexOf('Infinite') !== -1 ? 'var(--g)' : 'var(--y)';

    el.innerHTML =
      card('Net Worth', formatCurrency(k.netWorth), '', 'Total assets minus liabilities', 'var(--g)', 'var(--g)') +
      card('Net Liquid Assets', formatCurrency(k.netLiquidAssets), '', 'Cash & investments after tax', 'var(--b)', 'var(--b)') +
      card('Prosperity', k.prosperity, '', 'Financial runway', 'var(--g)', prosCC) +
      card('Personal Income', formatCurrency(k.personalIncome), '/ MO AVG', 'After-tax take-home', 'var(--o)', 'var(--muted)') +
      card('Personal Expenses', formatCurrency(k.personalExpenses), '/ MO AVG', 'Lifestyle spend', 'var(--r)', 'var(--muted)');
  }

  function renderIncomeStatement(data) {
    var el = document.getElementById('income-statement');
    var rows = data.incomeStatements;

    function deltaColor(d) {
      if (d === 'Perfect!') return 'var(--g)';
      return d >= 0 ? 'var(--g)' : 'var(--r)';
    }
    function deltaText(d) {
      if (d === 'Perfect!') return 'Perfect!';
      if (d >= 0) return '+' + formatCurrency(d);
      return '-' + formatCurrency(Math.abs(d));
    }

    var html = '<div class="panel-hdr"><div class="panel-title">Income Statement</div>' +
      '<div class="panel-badge">' + rows.length + ' MONTHS</div></div>';

    html += '<table class="income-table"><thead><tr>' +
      '<th>Month</th><th class="right">Revenue</th><th class="right">Net Inc</th>' +
      '<th class="right">Surplus</th><th class="right">Tax &Delta;</th><th class="right">Sav &Delta;</th>' +
      '</tr></thead><tbody>';

    rows.forEach(function (row) {
      html += '<tr>' +
        '<td>' + row.month + '</td>' +
        '<td class="right">' + formatCurrency(row.revenue) + '</td>' +
        '<td class="right" style="color:' + (row.netIncome >= 0 ? 'var(--g)' : 'var(--r)') + '">' + formatCurrency(row.netIncome) + '</td>' +
        '<td class="right" style="color:' + (row.surplus >= 0 ? 'var(--g)' : 'var(--r)') + '">' + formatCurrency(row.surplus) + '</td>' +
        '<td class="right" style="color:' + deltaColor(row.taxDelta) + '">' + deltaText(row.taxDelta) + '</td>' +
        '<td class="right" style="color:' + deltaColor(row.savingsDelta) + '">' + deltaText(row.savingsDelta) + '</td>' +
      '</tr>';
    });

    html += '</tbody></table>';

    var totRev = rows.reduce(function (s, d) { return s + d.revenue; }, 0);
    var totNet = rows.reduce(function (s, d) { return s + d.netIncome; }, 0);
    var totSur = rows.reduce(function (s, d) { return s + d.surplus; }, 0);

    html += '<div class="income-totals">' +
      '<span style="color:var(--muted)">TOTALS</span>' +
      '<span style="color:var(--white)">Rev ' + formatCurrency(totRev) +
      ' / Net ' + formatCurrency(totNet) +
      ' / Surplus ' + formatCurrency(totSur) + '</span></div>';

    el.innerHTML = html;
  }

  function renderProsperityPanel(data) {
    var el = document.getElementById('prosperity-panel');
    var latest = data.prosperityData[data.prosperityData.length - 1];
    if (!latest) return;

    var k = data.kpis;
    var isInfinite = k.prosperity.indexOf('Infinite') !== -1;
    var progressPct = isInfinite ? 100 : Math.min((latest.prosperityMonths / 120) * 100, 100);
    var barColor = isInfinite ? 'var(--g)' : (progressPct > 50 ? 'var(--g)' : 'var(--y)');
    var barShadow = isInfinite ? 'box-shadow:0 0 8px var(--g);' : '';

    var html = '<div class="panel-hdr"><div class="panel-title">Prosperity</div>' +
      '<div class="panel-badge">FINANCIAL RUNWAY</div></div>';

    html += '<div class="prosperity-big">' +
      '<div class="value" style="color:' + (isInfinite ? 'var(--g)' : 'var(--white)') + '">' + k.prosperity + '</div>' +
      '<div class="sub">' + (isInfinite ? 'PASSIVE INCOME COVERS EXPENSES' : 'UNTIL FUNDS RUN OUT') + '</div></div>';

    html += '<div class="prog" style="height:6px;margin-bottom:20px">' +
      '<div class="prog-fill" style="width:' + progressPct + '%;background:' + barColor + ';' + barShadow + '"></div></div>';

    function row(label, value, color) {
      return '<div class="prosperity-row">' +
        '<span class="label">' + label + '</span>' +
        '<span class="val" style="color:' + color + '">' + value + '</span></div>';
    }

    html += row('Net Liquid Assets', formatCurrency(latest.netLiquidAssets), 'var(--g)');
    html += row('Living Expenses', formatCurrency(latest.livingExpenses) + '/mo', 'var(--r)');
    html += row('Passive Income', formatCurrency(latest.passiveIncome) + '/mo', 'var(--b)');
    html += row('Net Burn Rate', formatCurrency(latest.livingExpenses - latest.passiveIncome) + '/mo', 'var(--y)');

    html += '<div class="prosperity-formula">' +
      '<span class="formula-text">Prosperity = NLA / (Living Expenses - Passive Income)</span><br>' +
      'Passive income assumes 5% annual return on investable assets (after 6-month reserve), taxed at 30%.</div>';

    el.innerHTML = html;
  }

  function renderWealthCoach(data) {
    var el = document.getElementById('wealth-coach');
    var messages = data.wealthCoach;

    var icons = {
      incomeTarget: 'TARGET',
      incomePace: 'PACE',
      surplusPlan: 'SURPLUS',
      taxAdvice: 'TAX',
      savingsAdvice: 'SAVINGS',
      lifestyleAdvice: 'LIFESTYLE',
    };

    function msgColor(key, text) {
      if (text.indexOf('short') !== -1 || text.indexOf('Short') !== -1 || text.indexOf('red') !== -1 || text.indexOf('Over by') !== -1) return 'var(--r)';
      if (text.indexOf('on track') !== -1 || text.indexOf('On target') !== -1 || text.indexOf('Ahead') !== -1 || text.indexOf('Perfect') !== -1 || text.indexOf('Under by') !== -1) return 'var(--g)';
      return 'var(--y)';
    }

    var html = '<div class="panel-hdr"><div class="panel-title">SOM Wealth Coach</div></div>';

    var entries = Object.entries(messages).filter(function (e) { return e[1] !== null; });

    if (entries.length === 0) {
      html += '<div style="font-size:11px;color:var(--muted);font-style:italic">Waiting for your numbers...</div>';
    } else {
      entries.forEach(function (e) {
        var key = e[0], text = e[1];
        html += '<div class="coach-section">' +
          '<div class="coach-label" style="color:' + msgColor(key, text) + '">' + (icons[key] || '') + '</div>' +
          '<div class="coach-text">' + text + '</div></div>';
      });
    }

    el.innerHTML = html;
  }

  function renderAssetLibrary(data) {
    var el = document.getElementById('asset-library');
    var categories = data.assetCategories;
    var lowRated = data.lowRatedAssets;
    var debtTip = data.debtTip;

    var totalMarket = categories.reduce(function (s, c) { return s + c.marketValue; }, 0);
    var totalEquity = categories.reduce(function (s, c) { return s + c.netEquity; }, 0);

    var html = '<div class="panel-hdr"><div class="panel-title">Asset Library</div>' +
      '<div class="panel-badge">' + categories.length + ' CATEGORIES</div></div>';

    html += '<div style="margin-bottom:20px">';
    categories.forEach(function (cat) {
      var pct = totalMarket > 0 ? (cat.marketValue / totalMarket) * 100 : 0;
      var barColor = cat.loanBalance > 0 ? 'var(--o)' : 'var(--g)';
      html += '<div class="asset-bar">' +
        '<div class="asset-bar-header"><span style="color:var(--text)">' + cat.category + '</span>' +
        '<span style="color:var(--white)">' + formatCurrency(cat.marketValue) + '</span></div>' +
        '<div class="prog" style="height:4px"><div class="prog-fill" style="width:' + pct + '%;background:' + barColor + '"></div></div>';
      if (cat.loanBalance > 0) {
        html += '<div class="asset-debt-note">Debt: ' + formatCurrency(cat.loanBalance) + ' / Equity: ' + formatCurrency(cat.netEquity) + '</div>';
      }
      html += '</div>';
    });
    html += '</div>';

    html += '<div class="asset-totals"><span class="label">TOTAL EQUITY</span>' +
      '<span class="value font-bebas">' + formatCurrency(totalEquity) + '</span></div>';

    if (lowRated.length > 0) {
      html += '<div style="margin-bottom:16px"><div class="low-rated-header">LOW-RATED ASSETS (TRUE COST)</div>';
      lowRated.forEach(function (a) {
        html += '<div class="low-rated-item">' +
          '<span style="color:var(--text)">' + a.name + ' <span style="color:var(--muted)">(' + a.rating + '/5)</span></span>' +
          '<span style="color:var(--r)">' + formatCurrency(a.trueMonthlyCost) + '/mo</span></div>';
      });
      html += '</div>';
    }

    html += '<div class="debt-tip"><span class="debt-tip-label">DEBT TIP</span><br>' + debtTip + '</div>';

    el.innerHTML = html;
  }

  function renderSellingPriority(data) {
    var el = document.getElementById('selling-priority');
    var items = data.sellingPriority;
    var maxVal = Math.max.apply(null, items.map(function (d) { return Math.abs(d.value); }));

    var html = '<div class="panel-hdr"><div class="panel-title">Selling Priority</div></div>';

    items.forEach(function (item) {
      var pct = maxVal > 0 ? (Math.abs(item.value) / maxVal) * 100 : 0;
      var isLiab = item.type === 'liability';
      var color = isLiab ? 'var(--r)' : 'var(--g)';

      html += '<div class="sell-item">' +
        '<div class="sell-item-header"><span style="color:var(--text)">' + item.name;
      if (isLiab) html += '<span class="sell-debt-tag">DEBT</span>';
      html += '</span><span style="color:' + color + '">' + formatCurrency(Math.abs(item.value)) + '</span></div>' +
        '<div class="prog" style="height:4px"><div class="prog-fill" style="width:' + pct + '%;background:' + color + ';opacity:0.7"></div></div></div>';
    });

    html += '<div class="sell-legend">' +
      '<span><span class="sell-legend-dot" style="background:var(--g)"></span>ASSETS BY VALUE</span>' +
      '<span><span class="sell-legend-dot" style="background:var(--r)"></span>LIABILITIES</span></div>';

    el.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════
  // 6. CHARTS (Chart.js)
  // ═══════════════════════════════════════════════════════════

  var chartColors = {
    green: '#00e5a0',
    blue: '#3d8aff',
    yellow: '#f0c040',
    red: '#ff3d5a',
    border: '#18182a',
    muted: '#42425a',
  };

  Chart.defaults.color = chartColors.muted;
  Chart.defaults.font.family = "'DM Mono', monospace";
  Chart.defaults.font.size = 10;

  function initRevenueChart(data) {
    var ctx = document.getElementById('revenue-chart').getContext('2d');
    var labels = data.revenueChartData.map(function (d) { return d.label; });
    var revData = data.revenueChartData.map(function (d) { return d.revenue; });
    var niData = data.revenueChartData.map(function (d) { return d.netIncome; });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'bar',
            label: 'Revenue',
            data: revData,
            backgroundColor: chartColors.green + '33',
            borderColor: chartColors.green + '66',
            borderWidth: 1,
            borderRadius: 2,
            order: 2,
          },
          {
            type: 'line',
            label: 'Net Income',
            data: niData,
            borderColor: chartColors.green,
            borderWidth: 2,
            pointBackgroundColor: chartColors.green,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.3,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, padding: 16, font: { size: 9 } } },
          tooltip: {
            backgroundColor: '#0f0f18',
            borderColor: '#22223a',
            borderWidth: 1,
            titleFont: { size: 9 },
            bodyFont: { size: 11 },
            callbacks: {
              label: function (ctx) { return ctx.dataset.label + ': $' + Math.round(ctx.parsed.y).toLocaleString(); },
            },
          },
        },
        scales: {
          x: { grid: { color: chartColors.border }, ticks: { font: { size: 10 } } },
          y: {
            grid: { color: chartColors.border },
            ticks: {
              font: { size: 10 },
              callback: function (v) { return formatCurrencyCompact(v); },
            },
          },
        },
      },
    });
  }

  function initNetWorthChart(data) {
    var ctx = document.getElementById('networth-chart').getContext('2d');
    var labels = data.netWorthChartData.map(function (d) { return d.label; });
    var nwData = data.netWorthChartData.map(function (d) { return d.netWorth; });
    var nlaData = data.netWorthChartData.map(function (d) { return d.netLiquidAssets; });

    var gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, chartColors.green + '4D');
    gradient.addColorStop(1, chartColors.green + '00');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Net Worth',
            data: nwData,
            borderColor: chartColors.green,
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.3,
            order: 2,
          },
          {
            label: 'Net Liquid Assets',
            data: nlaData,
            borderColor: chartColors.blue,
            borderWidth: 2,
            borderDash: [5, 3],
            pointBackgroundColor: chartColors.blue,
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.3,
            fill: false,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, padding: 16, font: { size: 9 } } },
          tooltip: {
            backgroundColor: '#0f0f18',
            borderColor: '#22223a',
            borderWidth: 1,
            titleFont: { size: 9 },
            bodyFont: { size: 11 },
            callbacks: {
              label: function (ctx) { return ctx.dataset.label + ': $' + Math.round(ctx.parsed.y).toLocaleString(); },
            },
          },
        },
        scales: {
          x: { grid: { color: chartColors.border }, ticks: { font: { size: 10 } } },
          y: {
            grid: { color: chartColors.border },
            ticks: {
              font: { size: 10 },
              callback: function (v) { return formatCurrencyCompact(v); },
            },
          },
        },
      },
    });
  }

  function initLifestyleChart(data) {
    var ctx = document.getElementById('lifestyle-chart').getContext('2d');
    var labels = data.lifestyleChartData.map(function (d) { return d.label; });
    var expData = data.lifestyleChartData.map(function (d) { return d.expenses; });
    var target = data.lifestyleChartData[0] ? data.lifestyleChartData[0].target : 20000;
    var targetData = data.lifestyleChartData.map(function () { return target; });

    var barColors = data.lifestyleChartData.map(function (d) {
      if (d.expenses <= d.target * 0.9) return chartColors.green + 'B3';
      if (d.expenses <= d.target) return chartColors.yellow + 'B3';
      return chartColors.red + 'B3';
    });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'bar',
            label: 'Expenses',
            data: expData,
            backgroundColor: barColors,
            borderRadius: 2,
            order: 2,
          },
          {
            type: 'line',
            label: 'Target',
            data: targetData,
            borderColor: chartColors.yellow,
            borderWidth: 1.5,
            borderDash: [5, 3],
            pointRadius: 0,
            fill: false,
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, padding: 16, font: { size: 9 } } },
          tooltip: {
            backgroundColor: '#0f0f18',
            borderColor: '#22223a',
            borderWidth: 1,
            titleFont: { size: 9 },
            bodyFont: { size: 11 },
            callbacks: {
              label: function (ctx) { return ctx.dataset.label + ': $' + Math.round(ctx.parsed.y).toLocaleString(); },
            },
          },
        },
        scales: {
          x: { grid: { color: chartColors.border }, ticks: { font: { size: 10 } } },
          y: {
            grid: { color: chartColors.border },
            ticks: {
              font: { size: 10 },
              callback: function (v) { return formatCurrencyCompact(v); },
            },
          },
        },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 7. INIT
  // ═══════════════════════════════════════════════════════════

  function init() {
    var computed = computeAll(sampleData);

    // Render all sections
    renderHeader(computed);
    renderStatusRow(computed);
    renderIncomeStatement(computed);
    renderProsperityPanel(computed);
    renderWealthCoach(computed);
    renderAssetLibrary(computed);
    renderSellingPriority(computed);

    // Set lifestyle badge
    var target = computed.lifestyleChartData[0] ? computed.lifestyleChartData[0].target : 20000;
    document.getElementById('lifestyle-badge').textContent = 'TARGET $' + target.toLocaleString() + '/MO';

    // Init charts
    initRevenueChart(computed);
    initNetWorthChart(computed);
    initLifestyleChart(computed);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
