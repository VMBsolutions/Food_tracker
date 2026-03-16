import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getLast7Days, getDayName, getToday } from '../utils';

export function DatePicker() {
  const selectedDate = useStore(s => s.selectedDate);
  const setSelectedDate = useStore(s => s.setSelectedDate);
  const today = getToday();

  const days = useMemo(() => getLast7Days(), []);

  const navigateDay = (offset: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + offset);
    const newDate = d.toISOString().split('T')[0];
    if (newDate <= today) setSelectedDate(newDate);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <button className="btn-icon btn-ghost" onClick={() => navigateDay(-1)}>
        <ChevronLeft size={18} />
      </button>

      <div style={{ display: 'flex', gap: 4 }}>
        {days.map(date => {
          const isSelected = date === selectedDate;
          const isToday = date === today;
          const dayNum = new Date(date + 'T12:00:00').getDate();

          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s',
                background: isSelected ? 'var(--forest)' : 'transparent',
                cursor: 'pointer',
                minWidth: 44,
              }}
            >
              <span style={{
                fontSize: '0.6rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: isSelected ? 'var(--sage-pale)' : 'var(--text-muted)',
              }}>
                {getDayName(date)}
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: isSelected ? '#fff' : 'var(--text-primary)',
              }}>
                {dayNum}
              </span>
              {isToday && (
                <span style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: isSelected ? 'var(--terracotta-light)' : 'var(--terracotta)',
                }} />
              )}
            </button>
          );
        })}
      </div>

      <button
        className="btn-icon btn-ghost"
        onClick={() => navigateDay(1)}
        style={{ opacity: selectedDate >= today ? 0.3 : 1 }}
        disabled={selectedDate >= today}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
