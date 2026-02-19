import type { MonthlyProsperity, KPISummary } from '@/engine/types';
import { formatCurrency } from '@/engine/formatters';

interface Props {
  data: MonthlyProsperity[];
  kpis: KPISummary;
}

export default function ProsperityPanel({ data, kpis }: Props) {
  const latest = data[data.length - 1];
  if (!latest) return null;

  const isInfinite = kpis.prosperity.includes('Infinite');
  const progressPct = isInfinite ? 100 : Math.min((latest.prosperityMonths / 120) * 100, 100);

  return (
    <div className="panel">
      <div className="panel-hdr">
        <div className="panel-title">Prosperity</div>
        <div className="panel-badge">FINANCIAL RUNWAY</div>
      </div>

      {/* Big number */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="font-bebas" style={{
          fontSize: 52,
          color: isInfinite ? 'var(--g)' : 'var(--white)',
          lineHeight: 1,
        }}>
          {kpis.prosperity}
        </div>
        <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.15em', marginTop: 4 }}>
          {isInfinite ? 'PASSIVE INCOME COVERS EXPENSES' : 'UNTIL FUNDS RUN OUT'}
        </div>
      </div>

      {/* Progress bar */}
      <div className="prog" style={{ height: 6, marginBottom: 20 }}>
        <div
          className="prog-fill"
          style={{
            width: `${progressPct}%`,
            background: isInfinite ? 'var(--g)' : progressPct > 50 ? 'var(--g)' : 'var(--y)',
            boxShadow: isInfinite ? '0 0 8px var(--g)' : undefined,
          }}
        />
      </div>

      {/* Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Row label="Net Liquid Assets" value={formatCurrency(latest.netLiquidAssets)} color="var(--g)" />
        <Row label="Living Expenses" value={formatCurrency(latest.livingExpenses) + '/mo'} color="var(--r)" />
        <Row label="Passive Income" value={formatCurrency(latest.passiveIncome) + '/mo'} color="var(--b)" />
        <Row
          label="Net Burn Rate"
          value={formatCurrency(latest.livingExpenses - latest.passiveIncome) + '/mo'}
          color="var(--y)"
        />
      </div>

      {/* Formula note */}
      <div style={{
        marginTop: 16,
        padding: '10px 12px',
        background: 'var(--s2)',
        border: '1px solid var(--border)',
        borderRadius: 3,
        fontSize: 9,
        color: 'var(--muted)',
        lineHeight: 1.7,
        letterSpacing: '0.04em',
      }}>
        <span className="font-serif" style={{ fontStyle: 'italic', color: 'var(--text)' }}>
          Prosperity = NLA / (Living Expenses - Passive Income)
        </span>
        <br />
        Passive income assumes 5% annual return on investable assets (after 6-month reserve), taxed at 30%.
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase' as const }}>
        {label}
      </span>
      <span className="font-bebas" style={{ fontSize: 20, color, lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}
