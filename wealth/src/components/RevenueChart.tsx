'use client';

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { RevenueChartPoint } from '@/engine/types';
import { CHART_COLORS } from '@/styles/theme';
import { formatCurrencyCompact } from '@/engine/formatters';

interface Props {
  data: RevenueChartPoint[];
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

export default function RevenueChart({ data }: Props) {
  return (
    <div className="panel">
      <div className="panel-hdr">
        <div className="panel-title">Revenue & Net Income</div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
          <XAxis dataKey="label" tick={{ fill: CHART_COLORS.muted, fontSize: 10 }} />
          <YAxis tickFormatter={formatCurrencyCompact} tick={{ fill: CHART_COLORS.muted, fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 9, letterSpacing: '0.1em', color: CHART_COLORS.muted }}
            iconType="circle"
            iconSize={6}
          />
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill={CHART_COLORS.green}
            fillOpacity={0.2}
            stroke={CHART_COLORS.green}
            strokeOpacity={0.4}
            radius={[2, 2, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="netIncome"
            name="Net Income"
            stroke={CHART_COLORS.green}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.green, r: 3 }}
            activeDot={{ r: 5, fill: CHART_COLORS.green }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
