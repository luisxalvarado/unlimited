import type { AssetCategorySummary, AssetComputed } from '@/engine/types';
import { formatCurrency } from '@/engine/formatters';

interface Props {
  categories: AssetCategorySummary[];
  lowRatedAssets: AssetComputed[];
  debtTip: string;
}

export default function AssetLibrary({ categories, lowRatedAssets, debtTip }: Props) {
  const totalMarket = categories.reduce((s, c) => s + c.marketValue, 0);
  const totalEquity = categories.reduce((s, c) => s + c.netEquity, 0);

  return (
    <div className="panel">
      <div className="panel-hdr">
        <div className="panel-title">Asset Library</div>
        <div className="panel-badge">{categories.length} CATEGORIES</div>
      </div>

      {/* Category bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {categories.map(cat => {
          const pct = totalMarket > 0 ? (cat.marketValue / totalMarket) * 100 : 0;
          return (
            <div key={cat.category}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                marginBottom: 4,
              }}>
                <span style={{ color: 'var(--text)' }}>{cat.category}</span>
                <span style={{ color: 'var(--white)' }}>{formatCurrency(cat.marketValue)}</span>
              </div>
              <div className="prog" style={{ height: 4 }}>
                <div className="prog-fill" style={{
                  width: `${pct}%`,
                  background: cat.loanBalance > 0 ? 'var(--o)' : 'var(--g)',
                }} />
              </div>
              {cat.loanBalance > 0 && (
                <div style={{ fontSize: 8, color: 'var(--muted)', marginTop: 2 }}>
                  Debt: {formatCurrency(cat.loanBalance)} / Equity: {formatCurrency(cat.netEquity)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTop: '1px solid var(--border2)',
        fontSize: 10,
        marginBottom: 16,
      }}>
        <span style={{ color: 'var(--muted)', letterSpacing: '0.15em' }}>TOTAL EQUITY</span>
        <span className="font-bebas" style={{ fontSize: 22, color: 'var(--white)' }}>
          {formatCurrency(totalEquity)}
        </span>
      </div>

      {/* Low-rated assets */}
      {lowRatedAssets.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 8,
            letterSpacing: '0.2em',
            color: 'var(--y)',
            textTransform: 'uppercase' as const,
            marginBottom: 8,
          }}>
            LOW-RATED ASSETS (TRUE COST)
          </div>
          {lowRatedAssets.map(a => (
            <div key={a.name} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              borderBottom: '1px solid var(--border)',
              fontSize: 10,
            }}>
              <span style={{ color: 'var(--text)' }}>
                {a.name} <span style={{ color: 'var(--muted)' }}>({a.rating}/5)</span>
              </span>
              <span style={{ color: 'var(--r)' }}>{formatCurrency(a.trueMonthlyCost)}/mo</span>
            </div>
          ))}
        </div>
      )}

      {/* Debt tip */}
      <div style={{
        padding: '10px 12px',
        background: 'var(--s2)',
        border: '1px solid var(--border)',
        borderRadius: 3,
        fontSize: 10,
        color: 'var(--text)',
        lineHeight: 1.6,
      }}>
        <span style={{ color: 'var(--y)', fontSize: 8, letterSpacing: '0.15em' }}>DEBT TIP</span>
        <br />
        {debtTip}
      </div>
    </div>
  );
}
