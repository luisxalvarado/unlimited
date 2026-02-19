export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs >= 1000
    ? '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : '$' + abs.toFixed(0);
  return value < 0 ? '-' + formatted : formatted;
}

export function formatCurrencyCompact(value: number): string {
  const abs = Math.abs(value);
  let formatted: string;
  if (abs >= 1_000_000) {
    formatted = '$' + (abs / 1_000_000).toFixed(1) + 'M';
  } else if (abs >= 1_000) {
    formatted = '$' + (abs / 1_000).toFixed(0) + 'K';
  } else {
    formatted = '$' + abs.toFixed(0);
  }
  return value < 0 ? '-' + formatted : formatted;
}

export function formatPct(value: number): string {
  return (value * 100).toFixed(1) + '%';
}

export function formatPctWhole(value: number): string {
  return (value * 100).toFixed(0) + '%';
}

export function formatDelta(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return sign + formatCurrency(value);
}

export function formatMonths(value: number): string {
  if (value >= 9999) return 'Infinite Prosperity';
  if (value >= 24) return (value / 12).toFixed(1) + ' Years';
  return value.toFixed(1) + ' Months';
}
