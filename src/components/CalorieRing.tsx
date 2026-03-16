import { motion } from 'framer-motion';

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export function CalorieRing({ consumed, goal, size = 200, strokeWidth = 14 }: CalorieRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(consumed / goal, 1);
  const remaining = Math.max(goal - consumed, 0);
  const isOver = consumed > goal;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--cream-dark)"
          strokeWidth={strokeWidth}
        />
        {/* Decorative inner ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth - 4}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isOver ? 'var(--rose)' : 'var(--terracotta)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - percentage) }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
        {/* Glow effect */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isOver ? 'var(--rose)' : 'var(--terracotta)'}
          strokeWidth={strokeWidth + 8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          opacity={0.15}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - percentage) }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: size * 0.19,
            fontWeight: 700,
            color: isOver ? 'var(--rose)' : 'var(--forest)',
            lineHeight: 1,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {consumed.toLocaleString()}
        </motion.span>
        <span style={{
          fontSize: size * 0.06,
          color: 'var(--text-muted)',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginTop: 4,
        }}>
          kcal consumed
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: size * 0.085,
          color: isOver ? 'var(--rose)' : 'var(--sage)',
          fontWeight: 500,
          fontStyle: 'italic',
          marginTop: 6,
        }}>
          {isOver ? `${consumed - goal} over` : `${remaining} left`}
        </span>
      </div>
    </div>
  );
}
