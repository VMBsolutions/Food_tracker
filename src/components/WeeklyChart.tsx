import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useStore } from '../store/useStore';
import { getLast7Days, getDayName, calculateDailySummary } from '../utils';
import type { LogEntry } from '../types';

const DEFAULT_GOAL = 2000;

export function WeeklyChart() {
  const convexEntries = useQuery(api.entries.getAll) ?? [];
  const goalsDoc = useQuery(api.userGoals.get);
  const goalCalories = goalsDoc?.calories ?? DEFAULT_GOAL;
  const selectedDate = useStore(s => s.selectedDate);

  const entries: LogEntry[] = useMemo(
    () => convexEntries.map(e => ({
      id: e._id, foodId: e.foodId, foodName: e.foodName,
      meal: e.meal, servings: e.servings, nutrition: e.nutrition,
      timestamp: e.timestamp, date: e.date,
    })),
    [convexEntries],
  );

  const data = useMemo(() => {
    return getLast7Days().map(date => {
      const summary = calculateDailySummary(entries, date);
      return {
        date,
        day: getDayName(date),
        calories: summary.totalCalories,
        goal: goalCalories,
      };
    });
  }, [entries, goalCalories]);

  return (
    <div className="card animate-in animate-in-delay-4">
      <div className="card-header">
        <h3 className="card-title">This Week</h3>
        <span className="badge badge-forest">7 days</span>
      </div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data} barCategoryGap="25%">
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: 'var(--stone)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: 'var(--forest)',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                padding: '8px 14px',
                boxShadow: 'var(--shadow-lg)',
              }}
              formatter={(value: number) => [`${value} kcal`, 'Calories']}
              cursor={{ fill: 'rgba(143, 174, 139, 0.08)' }}
            />
            <Bar dataKey="calories" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((entry) => (
                <Cell
                  key={entry.date}
                  fill={
                    entry.date === selectedDate
                      ? 'var(--terracotta)'
                      : entry.calories > entry.goal
                      ? 'var(--rose)'
                      : 'var(--sage)'
                  }
                  opacity={entry.date === selectedDate ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Goal reference line label */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
        marginTop: 8,
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }} />
          Under goal
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--terracotta)', display: 'inline-block' }} />
          Today
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--rose)', display: 'inline-block' }} />
          Over goal
        </span>
      </div>
    </div>
  );
}
