'use client';

import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { NetWorthChartPoint } from '@/engine/types';
import { CHART_COLORS } from '@/styles/theme';
import { formatCurrencyCompact } from '@/engine/formatters';

interface Props {
  data: NetWorthChartPoint[];
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

export default function NetWorthChart({ data }: Props) {
  return (
    <div className="panel">
      <div className="panel-hdr">
        <div className="panel-title">Net Worth & Liquid Assets</div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
          <defs>
            <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
          <XAxis dataKey="label" tick={{ fill: CHART_COLORS.muted, fontSize: 10 }} />
          <YAxis tickFormatter={formatCurrencyCompact} tick={{ fill: CHART_COLORS.muted, fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 9, letterSpacing: '0.1em', color: CHART_COLORS.muted }}
            iconType="circle"
            iconSize={6}
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            name="Net Worth"
            fill="url(#nwGrad)"
            stroke={CHART_COLORS.green}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="netLiquidAssets"
            name="Net Liquid Assets"
            stroke={CHART_COLORS.blue}
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ fill: CHART_COLORS.blue, r: 3 }}
            activeDot={{ r: 5, fill: CHART_COLORS.blue }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
