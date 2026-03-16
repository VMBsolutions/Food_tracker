import { motion } from 'framer-motion';

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color: string;
  delay?: number;
}

export function MacroBar({ label, current, goal, unit = 'g', color, delay = 0 }: MacroBarProps) {
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          fontSize: '0.8rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {label}
        </span>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {Math.round(current)}<span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}> / {goal}{unit}</span>
        </span>
      </div>
      <div style={{
        width: '100%',
        height: 8,
        background: 'var(--cream-dark)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}>
        <motion.div
          style={{
            height: '100%',
            background: color,
            borderRadius: 'var(--radius-full)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 + delay }}
        />
      </div>
    </div>
  );
}
