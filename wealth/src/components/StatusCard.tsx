interface StatusCardProps {
  label: string;
  value: string;
  unit?: string;
  context?: string;
  accentColor?: string;
  contextColor?: string;
}

export default function StatusCard({
  label,
  value,
  unit,
  context,
  accentColor = 'var(--g)',
  contextColor = 'var(--muted)',
}: StatusCardProps) {
  return (
    <div className="stat" style={{ '--ac': accentColor } as React.CSSProperties}>
      <div style={{
        fontSize: 8,
        letterSpacing: '0.3em',
        color: 'var(--muted)',
        textTransform: 'uppercase' as const,
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div className="font-bebas" style={{
        fontSize: 44,
        color: 'var(--white)',
        lineHeight: 1,
        marginBottom: 2,
      }}>
        {value}
      </div>
      {unit && (
        <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em' }}>
          {unit}
        </div>
      )}
      {context && (
        <div style={{ fontSize: 10, marginTop: 6, letterSpacing: '0.04em', color: contextColor }}>
          {context}
        </div>
      )}
    </div>
  );
}
