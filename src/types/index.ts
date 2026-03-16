export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  servingSize: string;
  servingGrams: number;
  nutrition: NutritionInfo;
  emoji?: string;
}

export interface LogEntry {
  id: string;
  foodId: string;
  foodName: string;
  meal: MealType;
  servings: number;
  nutrition: NutritionInfo;
  timestamp: number;
  date: string; // YYYY-MM-DD
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  entries: LogEntry[];
}

export interface UserProfile {
  name: string;
  goals: DailyGoals;
  createdAt: number;
}
