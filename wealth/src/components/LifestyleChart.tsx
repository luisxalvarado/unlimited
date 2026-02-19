'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import type { LifestyleChartPoint } from '@/engine/types';
import { CHART_COLORS } from '@/styles/theme';
import { formatCurrencyCompact } from '@/engine/formatters';

interface Props {
  data: LifestyleChartPoint[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="label">{label}</div>
      {payload.map((p, i) => (
        <div className="row" key={i}>
          <span><span className="dot" style={{ background: p.color }} />{p.name}</span>
          <span style={{ color: 'var(--white)' }}>${Math.round(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function barColor(expenses: number, target: number): string {
  if (expenses <= target * 0.9) return CHART_COLORS.green;
  if (expenses <= target) return CHART_COLORS.yellow;
  return CHART_COLORS.red;
}

export default function LifestyleChart({ data }: Props) {
  const target = data[0]?.target ?? 20000;

  return (
    <div className="panel">
      <div className="panel-hdr">
        <div className="panel-title">Lifestyle Expenses</div>
        <div className="panel-badge">TARGET ${target.toLocaleString()}/MO</div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
          <XAxis dataKey="label" tick={{ fill: CHART_COLORS.muted, fontSize: 10 }} />
          <YAxis tickFormatter={formatCurrencyCompact} tick={{ fill: CHART_COLORS.muted, fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={target}
            stroke={CHART_COLORS.yellow}
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{
              value: 'Target',
              position: 'right',
              fill: CHART_COLORS.yellow,
              fontSize: 9,
            }}
          />
          <Bar dataKey="expenses" name="Expenses" radius={[2, 2, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={barColor(entry.expenses, entry.target)} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
