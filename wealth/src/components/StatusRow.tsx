import StatusCard from './StatusCard';
import type { KPISummary } from '@/engine/types';
import { formatCurrency } from '@/engine/formatters';

interface StatusRowProps {
  kpis: KPISummary;
}

export default function StatusRow({ kpis }: StatusRowProps) {
  return (
    <div className="status-row">
      <StatusCard
        label="Net Worth"
        value={formatCurrency(kpis.netWorth)}
        context="Total assets minus liabilities"
        accentColor="var(--g)"
        contextColor="var(--g)"
      />
      <StatusCard
        label="Net Liquid Assets"
        value={formatCurrency(kpis.netLiquidAssets)}
        context="Cash & investments after tax"
        accentColor="var(--b)"
        contextColor="var(--b)"
      />
      <StatusCard
        label="Prosperity"
        value={kpis.prosperity}
        context="Financial runway"
        accentColor="var(--g)"
        contextColor={kpis.prosperity.includes('Infinite') ? 'var(--g)' : 'var(--y)'}
      />
      <StatusCard
        label="Personal Income"
        value={formatCurrency(kpis.personalIncome)}
        unit="/ MO AVG"
        context="After-tax take-home"
        accentColor="var(--o)"
        contextColor="var(--muted)"
      />
      <StatusCard
        label="Personal Expenses"
        value={formatCurrency(kpis.personalExpenses)}
        unit="/ MO AVG"
        context="Lifestyle spend"
        accentColor="var(--r)"
        contextColor="var(--muted)"
      />
    </div>
  );
}
