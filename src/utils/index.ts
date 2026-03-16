import type { LogEntry, NutritionInfo, DailySummary } from '../types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function getMonthDay(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(formatDate(d));
  }
  return days;
}

export function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(formatDate(d));
  }
  return days;
}

export function calculateDailySummary(entries: LogEntry[], date: string): DailySummary {
  const dayEntries = entries.filter(e => e.date === date);
  const totals = dayEntries.reduce(
    (acc, entry) => ({
      totalCalories: acc.totalCalories + entry.nutrition.calories,
      totalProtein: acc.totalProtein + entry.nutrition.protein,
      totalCarbs: acc.totalCarbs + entry.nutrition.carbs,
      totalFat: acc.totalFat + entry.nutrition.fat,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );

  return {
    date,
    ...totals,
    entries: dayEntries,
  };
}

export function scaleNutrition(nutrition: NutritionInfo, servings: number): NutritionInfo {
  return {
    calories: Math.round(nutrition.calories * servings),
    protein: Math.round(nutrition.protein * servings * 10) / 10,
    carbs: Math.round(nutrition.carbs * servings * 10) / 10,
    fat: Math.round(nutrition.fat * servings * 10) / 10,
    fiber: nutrition.fiber ? Math.round(nutrition.fiber * servings * 10) / 10 : undefined,
  };
}

export function getMealEmoji(meal: string): string {
  const map: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snacks: '✨',
  };
  return map[meal] || '🍽️';
}

export function getMealLabel(meal: string): string {
  return meal.charAt(0).toUpperCase() + meal.slice(1);
}

export function percentOf(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((value / total) * 100), 100);
}
