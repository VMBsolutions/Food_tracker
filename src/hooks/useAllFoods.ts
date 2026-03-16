import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { defaultFoods } from '../services/foodDatabase';
import type { FoodItem } from '../types';

export function useAllFoods(): FoodItem[] {
  const convexCustomFoods = useQuery(api.customFoods.list) ?? [];

  const customFoods: FoodItem[] = useMemo(
    () =>
      convexCustomFoods.map(f => ({
        id: f._id,
        name: f.name,
        category: f.category,
        servingSize: f.servingSize,
        servingGrams: f.servingGrams,
        nutrition: f.nutrition,
        emoji: f.emoji,
      })),
    [convexCustomFoods],
  );

  return useMemo(() => [...defaultFoods, ...customFoods], [customFoods]);
}
