import type { IncomeStatementComputed } from '@/engine/types';
import { formatCurrency } from '@/engine/formatters';

interface Props {
  data: IncomeStatementComputed[];
}

function deltaColor(delta: number | 'Perfect!'): string {
  if (delta === 'Perfect!') return 'var(--g)';
  return delta >= 0 ? 'var(--g)' : 'var(--r)';
}

function deltaText(delta: number | 'Perfect!'): string {
  if (delta === 'Perfect!') return 'Perfect!';
  if (delta >= 0) return '+' + formatCurrency(delta);
  return '-' + formatCurrency(Math.abs(delta));
}

export default function IncomeStatement({ data }: Props) {
  return (
    <div className="panel" style={{ overflow: 'auto' }}>
      <div className="panel-hdr">
        <div className="panel-title">Income Statement</div>
        <div className="panel-badge">{data.length} MONTHS</div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Month</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Revenue</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Net Inc</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Surplus</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Tax &Delta;</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Sav &Delta;</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={tdStyle}>{row.month}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.revenue)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', color: row.netIncome >= 0 ? 'var(--g)' : 'var(--r)' }}>
                {formatCurrency(row.netIncome)}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', color: row.surplus >= 0 ? 'var(--g)' : 'var(--r)' }}>
                {formatCurrency(row.surplus)}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', color: deltaColor(row.taxDelta) }}>
                {deltaText(row.taxDelta)}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', color: deltaColor(row.savingsDelta) }}>
                {deltaText(row.savingsDelta)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Totals row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid var(--border2)',
        fontSize: 10,
        letterSpacing: '0.05em',
      }}>
        <span style={{ color: 'var(--muted)' }}>TOTALS</span>
        <span style={{ color: 'var(--white)' }}>
          Rev {formatCurrency(data.reduce((s, d) => s + d.revenue, 0))}
          {' / '}
          Net {formatCurrency(data.reduce((s, d) => s + d.netIncome, 0))}
          {' / '}
          Surplus {formatCurrency(data.reduce((s, d) => s + d.surplus, 0))}
        </span>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  fontSize: 8,
  letterSpacing: '0.25em',
  color: 'var(--muted)',
  textAlign: 'left',
  padding: '8px 6px',
  borderBottom: '1px solid var(--border)',
  fontWeight: 400,
  textTransform: 'uppercase',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 6px',
  fontSize: 11,
  color: 'var(--text)',
};
