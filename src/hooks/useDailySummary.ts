import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useStore } from '../store/useStore';
import { calculateDailySummary } from '../utils';
import type { DailyGoals, LogEntry } from '../types';

const DEFAULT_GOALS: DailyGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

export function useDailySummary(date?: string) {
  const selectedDate = useStore(s => s.selectedDate);
  const targetDate = date ?? selectedDate;

  const convexEntries = useQuery(api.entries.getByDate, { date: targetDate }) ?? [];
  const goalsDoc = useQuery(api.userGoals.get);
  const goals: DailyGoals = goalsDoc
    ? { calories: goalsDoc.calories, protein: goalsDoc.protein, carbs: goalsDoc.carbs, fat: goalsDoc.fat }
    : DEFAULT_GOALS;

  // Map Convex entries to the LogEntry shape the utility expects
  const entries: LogEntry[] = useMemo(
    () =>
      convexEntries.map(e => ({
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

  const summary = useMemo(() => calculateDailySummary(entries, targetDate), [entries, targetDate]);

  const percentages = useMemo(() => ({
    calories: goals.calories > 0 ? Math.min((summary.totalCalories / goals.calories) * 100, 100) : 0,
    protein: goals.protein > 0 ? Math.min((summary.totalProtein / goals.protein) * 100, 100) : 0,
    carbs: goals.carbs > 0 ? Math.min((summary.totalCarbs / goals.carbs) * 100, 100) : 0,
    fat: goals.fat > 0 ? Math.min((summary.totalFat / goals.fat) * 100, 100) : 0,
  }), [summary, goals]);

  return { summary, goals, percentages };
}
