import type { SellingPriorityItem } from '@/engine/types';
import { formatCurrency } from '@/engine/formatters';

interface Props {
  data: SellingPriorityItem[];
}

export default function SellingPriority({ data }: Props) {
  const maxVal = Math.max(...data.map(d => Math.abs(d.value)));

  return (
    <div className="panel">
      <div className="panel-hdr">
        <div className="panel-title">Selling Priority</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((item, i) => {
          const pct = maxVal > 0 ? (Math.abs(item.value) / maxVal) * 100 : 0;
          const isLiab = item.type === 'liability';
          const color = isLiab ? 'var(--r)' : 'var(--g)';

          return (
            <div key={i}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                marginBottom: 3,
              }}>
                <span style={{ color: 'var(--text)' }}>
                  {item.name}
                  {isLiab && (
                    <span style={{
                      fontSize: 8,
                      color: 'var(--r)',
                      marginLeft: 6,
                      letterSpacing: '0.1em',
                    }}>
                      DEBT
                    </span>
                  )}
                </span>
                <span style={{ color }}>
                  {formatCurrency(Math.abs(item.value))}
                </span>
              </div>
              <div className="prog" style={{ height: 4 }}>
                <div className="prog-fill" style={{
                  width: `${pct}%`,
                  background: color,
                  opacity: 0.7,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid var(--border2)',
        fontSize: 8,
        letterSpacing: '0.15em',
        color: 'var(--muted)',
      }}>
        <span>
          <span style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--g)',
            marginRight: 4,
          }} />
          ASSETS BY VALUE
        </span>
        <span>
          <span style={{
            display: 'inline-block',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--r)',
            marginRight: 4,
          }} />
          LIABILITIES
        </span>
      </div>
    </div>
  );
}
