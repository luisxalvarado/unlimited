interface HeaderProps {
  name: string;
}

export default function Header({ name }: HeaderProps) {
  const parts = name.split(' ');
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      alignItems: 'end',
      paddingBottom: 20,
      borderBottom: '1px solid var(--border)',
      marginBottom: 24,
    }}>
      <div>
        <div style={{
          fontSize: 9,
          letterSpacing: '0.4em',
          color: 'var(--g)',
          textTransform: 'uppercase' as const,
          marginBottom: 4,
        }}>
          Wealth Intelligence
        </div>
        <h1 className="font-bebas" style={{
          fontSize: 58,
          letterSpacing: '0.03em',
          color: 'var(--white)',
          lineHeight: 1,
        }}>
          {firstName} <span style={{ color: 'var(--g)' }}>{lastName}</span>
        </h1>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: 9,
          color: 'var(--muted)',
          letterSpacing: '0.12em',
          marginBottom: 6,
        }}>
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div className="panel-badge">
          PERSONAL WEALTH MAP V3.2.2
        </div>
      </div>
    </div>
  );
}
