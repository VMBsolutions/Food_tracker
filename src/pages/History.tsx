import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { Calendar, TrendingUp, Award } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getLast7Days, getLast30Days, getDayName, getMonthDay, calculateDailySummary } from '../utils';
import type { DailyGoals, LogEntry } from '../types';

const DEFAULT_GOALS: DailyGoals = { calories: 2000, protein: 150, carbs: 250, fat: 65 };

type Range = '7d' | '30d';

export function History() {
  const [range, setRange] = useState<Range>('7d');
  const convexEntries = useQuery(api.entries.getAll) ?? [];
  const goalsDoc = useQuery(api.userGoals.get);
  const goals: DailyGoals = goalsDoc
    ? { calories: goalsDoc.calories, protein: goalsDoc.protein, carbs: goalsDoc.carbs, fat: goalsDoc.fat }
    : DEFAULT_GOALS;

  const entries: LogEntry[] = useMemo(
    () => convexEntries.map(e => ({
      id: e._id,
      foodId: e.foodId,
      foodName: e.foodName,
      meal: e.meal,
      servings: e.servings,
      nutrition: e.nutrition,
      timestamp: e.timestamp,
      date: e.date,
    })),
    [convexEntries],
  );

  const days = range === '7d' ? getLast7Days() : getLast30Days();

  const data = useMemo(() => {
    return days.map(date => {
      const s = calculateDailySummary(entries, date);
      return {
        date,
        label: range === '7d' ? getDayName(date) : getMonthDay(date),
        calories: s.totalCalories,
        protein: s.totalProtein,
        carbs: s.totalCarbs,
        fat: s.totalFat,
      };
    });
  }, [entries, days, range]);

  const stats = useMemo(() => {
    const daysWithData = data.filter(d => d.calories > 0);
    if (daysWithData.length === 0) return { avg: 0, best: 0, streak: 0 };
    const avg = Math.round(daysWithData.reduce((s, d) => s + d.calories, 0) / daysWithData.length);
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].calories > 0 && data[i].calories <= goals.calories * 1.1) streak++;
      else break;
    }
    return {
      avg,
      best: Math.min(...daysWithData.map(d => Math.abs(d.calories - goals.calories))),
      streak,
    };
  }, [data, goals.calories]);

  return (
    <div>
      <motion.div className="page-header animate-in">
        <h2>History</h2>
        <p>Your nutrition trends over time</p>
      </motion.div>

      {/* Range toggle */}
      <motion.div className="animate-in animate-in-delay-1" style={{
        display: 'flex',
        gap: 4,
        marginBottom: 28,
        background: 'var(--cream)',
        borderRadius: 'var(--radius-md)',
        padding: 4,
        width: 'fit-content',
      }}>
        {(['7d', '30d'] as Range[]).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 500,
              background: range === r ? 'var(--bg-card)' : 'transparent',
              color: range === r ? 'var(--forest)' : 'var(--text-muted)',
              boxShadow: range === r ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
          >
            {r === '7d' ? '7 Days' : '30 Days'}
          </button>
        ))}
      </motion.div>

      {/* Stats cards */}
      <motion.div className="grid-3 animate-in animate-in-delay-2" style={{ marginBottom: 28 }}>
        {[
          { icon: TrendingUp, label: 'Daily Average', value: `${stats.avg}`, unit: 'kcal', color: 'var(--terracotta)' },
          { icon: Award, label: 'On-Target Streak', value: `${stats.streak}`, unit: 'days', color: 'var(--sage)' },
          { icon: Calendar, label: 'Days Logged', value: `${data.filter(d => d.calories > 0).length}`, unit: `of ${days.length}`, color: 'var(--sky)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '20px 24px',
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: `${stat.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--forest)',
                lineHeight: 1,
              }}>
                {stat.value} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>{stat.unit}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Calories area chart */}
      <motion.div className="card animate-in animate-in-delay-3" style={{ marginBottom: 24, padding: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Calorie Intake</h3>
          <span className="badge badge-terracotta">Goal: {goals.calories} kcal</span>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--terracotta)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--terracotta)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--stone)' }}
                axisLine={false}
                tickLine={false}
                interval={range === '30d' ? 4 : 0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--stone)' }}
                axisLine={false}
                tickLine={false}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--forest)',
                  border: 'none',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 13,
                  padding: '8px 14px',
                }}
                formatter={(value: number) => [`${value} kcal`, 'Calories']}
              />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="var(--terracotta)"
                strokeWidth={2.5}
                fill="url(#calGrad)"
                dot={{ fill: 'var(--terracotta)', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: 'var(--terracotta)', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Macros bar chart */}
      <motion.div className="card animate-in animate-in-delay-4" style={{ padding: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Macronutrient Breakdown</h3>
        </div>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={data} barCategoryGap="20%">
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--stone)' }}
                axisLine={false}
                tickLine={false}
                interval={range === '30d' ? 4 : 0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--stone)' }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--forest)',
                  border: 'none',
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 13,
                  padding: '8px 14px',
                }}
              />
              <Bar dataKey="protein" name="Protein" fill="var(--sky)" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="carbs" name="Carbs" fill="var(--amber)" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="fat" name="Fat" fill="var(--rose)" radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginTop: 12,
        }}>
          {[
            { label: 'Protein', color: 'var(--sky)' },
            { label: 'Carbs', color: 'var(--amber)' },
            { label: 'Fat', color: 'var(--rose)' },
          ].map(m => (
            <span key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
              {m.label}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
