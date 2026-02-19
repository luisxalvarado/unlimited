import type { WealthCoachMessage } from '@/engine/types';

interface Props {
  messages: WealthCoachMessage;
}

function messageIcon(key: string): string {
  const icons: Record<string, string> = {
    incomeTarget: 'TARGET',
    incomePace: 'PACE',
    surplusPlan: 'SURPLUS',
    taxAdvice: 'TAX',
    savingsAdvice: 'SAVINGS',
    lifestyleAdvice: 'LIFESTYLE',
  };
  return icons[key] ?? '';
}

function messageColor(key: string, text: string): string {
  if (text.includes('short') || text.includes('Short') || text.includes('red') || text.includes('Over by')) {
    return 'var(--r)';
  }
  if (text.includes('on track') || text.includes('On target') || text.includes('Ahead') || text.includes('Perfect') || text.includes('Under by')) {
    return 'var(--g)';
  }
  return 'var(--y)';
}

export default function WealthCoach({ messages }: Props) {
  const entries = Object.entries(messages).filter(
    (entry): entry is [string, string] => entry[1] !== null
  );

  return (
    <div className="panel">
      <div className="panel-hdr">
        <div className="panel-title">SOM Wealth Coach</div>
      </div>

      {entries.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>
          Waiting for your numbers...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entries.map(([key, text]) => (
            <div key={key}>
              <div style={{
                fontSize: 8,
                letterSpacing: '0.2em',
                color: messageColor(key, text),
                textTransform: 'uppercase' as const,
                marginBottom: 4,
              }}>
                {messageIcon(key)}
              </div>
              <div className="font-serif" style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: 'var(--text)',
                fontStyle: 'italic',
              }}>
                {text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
