import type { IncomeStatementComputed, WealthConfig } from './types';
import type { WealthCoachMessage } from './types';

/**
 * Replicates the SOM Wealth Coach LET formula from Income C17.
 * See wealth-map-formulas.md lines 219-375 for the complete original formula.
 */
export function generateWealthCoach(
  incomes: IncomeStatementComputed[],
  config: WealthConfig
): WealthCoachMessage {
  if (incomes.length === 0) {
    return {
      incomeTarget: null,
      incomePace: null,
      surplusPlan: null,
      taxAdvice: null,
      savingsAdvice: null,
      lifestyleAdvice: null,
    };
  }

  // ─── Aggregate Totals (P11, P15, P16) ───────────────────
  const surplusTotal = incomes.reduce((sum, i) => sum + i.surplus, 0);
  const taxDeltaTotal = incomes.reduce((sum, i) => {
    return sum + (typeof i.taxDelta === 'number' ? i.taxDelta : 0);
  }, 0);
  const savDeltaTotal = incomes.reduce((sum, i) => {
    return sum + (typeof i.savingsDelta === 'number' ? i.savingsDelta : 0);
  }, 0);

  // ─── Lifestyle stats ───────────────────────────────────────
  const months = incomes.length;
  const lifeTotal = incomes.reduce((sum, i) => sum + i.lifestyle, 0);
  const lifeAvg = months > 0 ? lifeTotal / months : 0;

  // ─── Latest targets ────────────────────────────────────────
  const lastIncome = incomes[incomes.length - 1];
  const lastLifeGoal = lastIncome.lifestyleTarget;
  const taxRate = lastIncome.taxTarget;
  const savRate = lastIncome.savingsTarget;

  // ─── Net income stats ──────────────────────────────────────
  const netTotal = incomes.reduce((sum, i) => sum + i.netIncome, 0);
  const netAvg = months > 0 ? netTotal / months : 0;

  // ─── Required net income per month ─────────────────────────
  const capRate = 1 - (taxRate + savRate);
  const reqNetPM = capRate > 0 && lastLifeGoal > 0 ? lastLifeGoal / capRate : null;
  const gapNetPM = reqNetPM !== null ? reqNetPM - netAvg : null;

  // ─── Shortfalls ────────────────────────────────────────────
  const taxShort = Math.max(0, -taxDeltaTotal);
  const savShort = Math.max(0, -savDeltaTotal);

  // ─── Surplus allocation waterfall ──────────────────────────
  const surplus = surplusTotal;
  const useSurpTax = surplus > 0 ? Math.min(surplus, taxShort) : 0;
  const surpAfterTax = surplus > 0 ? surplus - useSurpTax : 0;
  const useSurpSav = surpAfterTax > 0 ? Math.min(surpAfterTax, savShort) : 0;

  const taxRem1 = Math.max(0, taxShort - useSurpTax);
  const savRem1 = Math.max(0, savShort - useSurpSav);

  const savAhead = Math.max(0, savDeltaTotal);
  const taxAhead = Math.max(0, taxDeltaTotal);

  const shiftSavToTax = taxRem1 > 0 ? Math.min(savAhead, taxRem1) : 0;
  const shiftTaxToSav = savRem1 > 0 ? Math.min(taxAhead, savRem1) : 0;

  const taxRem = Math.max(0, taxRem1 - shiftSavToTax);
  const savRem = Math.max(0, savRem1 - shiftTaxToSav);

  // ─── Build tax actions string ──────────────────────────────
  const taxActions: string[] = [];
  if (useSurpTax > 0) taxActions.push(`Use ${fmt(useSurpTax)} of surplus to top it up.`);
  if (shiftSavToTax > 0) taxActions.push(`Shift ${fmt(shiftSavToTax)} from your savings -> tax.`);

  const savActions: string[] = [];
  if (useSurpSav > 0) savActions.push(`Use ${fmt(useSurpSav)} of surplus to top it up.`);
  if (shiftTaxToSav > 0) savActions.push(`Shift ${fmt(shiftTaxToSav)} from your tax -> savings.`);

  // ─── MESSAGE 1: Income Target ──────────────────────────────
  let incomeTarget: string | null = null;
  if (reqNetPM !== null) {
    incomeTarget =
      `Net income target: To spend ${fmt(lastLifeGoal)}/mo on lifestyle while allocating ` +
      `${pct(taxRate)} to tax and ${pct(savRate)} to savings, you need net income of ~${fmt(reqNetPM)}/mo.`;
  } else if (lastLifeGoal > 0) {
    incomeTarget =
      'Net income target: Add your Tax% and Savings% so I can calculate the net income needed to fund your lifestyle goal.';
  }

  // ─── MESSAGE 2: Income Pace ────────────────────────────────
  let incomePace: string | null = null;
  if (reqNetPM !== null && gapNetPM !== null) {
    if (gapNetPM > 0) {
      incomePace = `Current pace: Averaging ${fmt(netAvg)}/mo net income \u2014 short by ${fmt(gapNetPM)}/mo.`;
    } else {
      incomePace = `Current pace: Averaging ${fmt(netAvg)}/mo net income \u2014 on track.`;
    }
  }

  // ─── MESSAGE 3: Surplus Plan ───────────────────────────────
  let surplusPlan: string | null = null;
  if (surplus > 0) {
    if (taxShort + savShort > 0) {
      let msg = `Surplus: You've got ${fmt(surplus)}. Cover Tax/Savings shortfalls first \u2014 don't let this quietly turn into lifestyle creep.`;
      if (useSurpTax > 0) msg += ` Tax +${fmt(useSurpTax)}.`;
      if (useSurpSav > 0) msg += ` Savings +${fmt(useSurpSav)}.`;
      const remaining = surpAfterTax - useSurpSav;
      if (remaining > 0) msg += ` Remaining ${fmt(remaining)}? Allocate it intentionally (investing beats mystery spending).`;
      surplusPlan = msg;
    } else {
      surplusPlan = `Surplus: ${fmt(surplus)}. Nice \u2014 assign it on purpose (invest > accidental spending).`;
    }
  } else if (surplus < 0) {
    surplusPlan =
      `Surplus: You're in the red by ${fmt(-surplus)}. You've allocated more than you earned. Pull lifestyle back or increase income until you're back at $0.`;
  } else {
    surplusPlan = 'Surplus: Exactly $0. Clean. Perfect.';
  }

  // ─── MESSAGE 4: Tax Advice ─────────────────────────────────
  let taxAdvice: string | null = null;
  if (taxDeltaTotal < 0) {
    let msg = `Tax: Short ${fmt(-taxDeltaTotal)}.`;
    if (useSurpTax > 0 || shiftSavToTax > 0) {
      msg += ' ' + taxActions.join(' ');
      if (taxRem > 0) {
        msg += ` Even after those moves, you're still short ${fmt(taxRem)} \u2014 fix it by earning more or trimming allocations (start with lifestyle).`;
      } else {
        msg += ' Back on target.';
      }
    } else {
      msg += " There isn't any surplus or savings available to reallocate right now \u2014 fix it by earning more or trimming allocations (start with lifestyle).";
    }
    taxAdvice = msg;
  } else if (taxDeltaTotal > 0) {
    taxAdvice = `Tax: Ahead by ${fmt(taxDeltaTotal)}. Keep some buffer (a future tax bill won't be impressed by optimism).`;
  } else {
    taxAdvice = 'Tax: On target.';
  }

  // ─── MESSAGE 5: Savings Advice ─────────────────────────────
  let savingsAdvice: string | null = null;
  if (savDeltaTotal < 0) {
    let msg = `Savings: Short ${fmt(-savDeltaTotal)}.`;
    if (useSurpSav > 0 || shiftTaxToSav > 0) {
      msg += ' ' + savActions.join(' ');
      if (savRem > 0) {
        msg += ` Even after those moves, you're still short ${fmt(savRem)} \u2014 fix it by earning more or trimming allocations (start with lifestyle).`;
      } else {
        msg += ' Back on target.';
      }
    } else {
      msg += " There isn't any surplus or tax available to reallocate right now \u2014 fix it by earning more or trimming allocations (start with lifestyle).";
    }
    savingsAdvice = msg;
  } else if (savDeltaTotal > 0) {
    savingsAdvice = `Savings: Ahead by ${fmt(savDeltaTotal)}. That's how freedom compounds.`;
  } else {
    savingsAdvice = 'Savings: On target.';
  }

  // ─── MESSAGE 6: Lifestyle Advice ───────────────────────────
  let lifestyleAdvice: string | null = null;
  if (months > 0 && lastLifeGoal > 0) {
    let msg = `Lifestyle (per month): Allocated ${fmt(lifeTotal)} across ${months} month(s) = ${fmt(lifeAvg)}/mo. Latest goal: ${fmt(lastLifeGoal)}/mo. `;
    if (lifeAvg < lastLifeGoal) {
      msg += `Under by ${fmt(lastLifeGoal - lifeAvg)}/mo.`;
    } else if (lifeAvg > lastLifeGoal) {
      msg += `Over by ${fmt(lifeAvg - lastLifeGoal)}/mo. If that's intentional, fine \u2014 if not, rein it in.`;
    } else {
      msg += 'Right on the goal.';
    }
    lifestyleAdvice = msg;
  }

  return {
    incomeTarget,
    incomePace,
    surplusPlan,
    taxAdvice,
    savingsAdvice,
    lifestyleAdvice,
  };
}

function fmt(n: number): string {
  return '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
}

function pct(n: number): string {
  return Math.round(n * 100) + '%';
}
