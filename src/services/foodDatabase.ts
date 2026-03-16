import type { FoodItem } from '../types';

export const defaultFoods: FoodItem[] = [
  // Breakfast
  { id: 'f1', name: 'Oatmeal', category: 'Grains', servingSize: '1 cup cooked', servingGrams: 234, nutrition: { calories: 154, protein: 5.4, carbs: 27.4, fat: 2.6, fiber: 4 }, emoji: '🥣' },
  { id: 'f2', name: 'Scrambled Eggs', category: 'Protein', servingSize: '2 large eggs', servingGrams: 122, nutrition: { calories: 182, protein: 12.2, carbs: 2.4, fat: 13.4 }, emoji: '🥚' },
  { id: 'f3', name: 'Greek Yogurt', category: 'Dairy', servingSize: '1 cup', servingGrams: 245, nutrition: { calories: 130, protein: 22, carbs: 8, fat: 0.7 }, emoji: '🥛' },
  { id: 'f4', name: 'Banana', category: 'Fruits', servingSize: '1 medium', servingGrams: 118, nutrition: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1 }, emoji: '🍌' },
  { id: 'f5', name: 'Whole Wheat Toast', category: 'Grains', servingSize: '1 slice', servingGrams: 46, nutrition: { calories: 120, protein: 5, carbs: 20, fat: 2 }, emoji: '🍞' },
  { id: 'f6', name: 'Avocado Toast', category: 'Mixed', servingSize: '1 slice w/ half avo', servingGrams: 120, nutrition: { calories: 240, protein: 6, carbs: 24, fat: 14, fiber: 7 }, emoji: '🥑' },
  { id: 'f7', name: 'Smoothie Bowl', category: 'Mixed', servingSize: '1 bowl', servingGrams: 350, nutrition: { calories: 320, protein: 8, carbs: 52, fat: 10, fiber: 6 }, emoji: '🫐' },
  { id: 'f8', name: 'Granola', category: 'Grains', servingSize: '1/2 cup', servingGrams: 55, nutrition: { calories: 260, protein: 6, carbs: 38, fat: 10, fiber: 3 }, emoji: '🥜' },

  // Lunch / Dinner proteins
  { id: 'f9', name: 'Grilled Chicken Breast', category: 'Protein', servingSize: '6 oz', servingGrams: 170, nutrition: { calories: 280, protein: 53, carbs: 0, fat: 6 }, emoji: '🍗' },
  { id: 'f10', name: 'Salmon Fillet', category: 'Protein', servingSize: '6 oz', servingGrams: 170, nutrition: { calories: 350, protein: 38, carbs: 0, fat: 22 }, emoji: '🐟' },
  { id: 'f11', name: 'Ground Turkey', category: 'Protein', servingSize: '4 oz', servingGrams: 113, nutrition: { calories: 170, protein: 21, carbs: 0, fat: 9 }, emoji: '🦃' },
  { id: 'f12', name: 'Tofu', category: 'Protein', servingSize: '1/2 block', servingGrams: 126, nutrition: { calories: 94, protein: 10, carbs: 2.3, fat: 5.6 }, emoji: '🧊' },
  { id: 'f13', name: 'Black Beans', category: 'Legumes', servingSize: '1 cup cooked', servingGrams: 172, nutrition: { calories: 227, protein: 15.2, carbs: 40.8, fat: 0.9, fiber: 15 }, emoji: '🫘' },
  { id: 'f14', name: 'Lentils', category: 'Legumes', servingSize: '1 cup cooked', servingGrams: 198, nutrition: { calories: 230, protein: 17.9, carbs: 39.9, fat: 0.8, fiber: 15.6 }, emoji: '🍲' },

  // Carbs / sides
  { id: 'f15', name: 'Brown Rice', category: 'Grains', servingSize: '1 cup cooked', servingGrams: 195, nutrition: { calories: 216, protein: 5, carbs: 44.8, fat: 1.8, fiber: 3.5 }, emoji: '🍚' },
  { id: 'f16', name: 'Quinoa', category: 'Grains', servingSize: '1 cup cooked', servingGrams: 185, nutrition: { calories: 222, protein: 8.1, carbs: 39.4, fat: 3.6, fiber: 5.2 }, emoji: '🌾' },
  { id: 'f17', name: 'Sweet Potato', category: 'Vegetables', servingSize: '1 medium', servingGrams: 130, nutrition: { calories: 112, protein: 2, carbs: 26, fat: 0.1, fiber: 3.8 }, emoji: '🍠' },
  { id: 'f18', name: 'Pasta', category: 'Grains', servingSize: '1 cup cooked', servingGrams: 140, nutrition: { calories: 220, protein: 8, carbs: 43, fat: 1.3, fiber: 2.5 }, emoji: '🍝' },

  // Vegetables
  { id: 'f19', name: 'Broccoli', category: 'Vegetables', servingSize: '1 cup', servingGrams: 91, nutrition: { calories: 31, protein: 2.6, carbs: 6, fat: 0.3, fiber: 2.4 }, emoji: '🥦' },
  { id: 'f20', name: 'Spinach Salad', category: 'Vegetables', servingSize: '2 cups', servingGrams: 60, nutrition: { calories: 14, protein: 1.7, carbs: 2.2, fat: 0.2, fiber: 1.3 }, emoji: '🥗' },
  { id: 'f21', name: 'Mixed Vegetables', category: 'Vegetables', servingSize: '1 cup', servingGrams: 182, nutrition: { calories: 118, protein: 5.2, carbs: 23.8, fat: 0.3, fiber: 7.8 }, emoji: '🥕' },

  // Snacks
  { id: 'f22', name: 'Apple', category: 'Fruits', servingSize: '1 medium', servingGrams: 182, nutrition: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 }, emoji: '🍎' },
  { id: 'f23', name: 'Almonds', category: 'Nuts', servingSize: '1 oz (23 nuts)', servingGrams: 28, nutrition: { calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5 }, emoji: '🌰' },
  { id: 'f24', name: 'Protein Bar', category: 'Snacks', servingSize: '1 bar', servingGrams: 60, nutrition: { calories: 210, protein: 20, carbs: 22, fat: 8, fiber: 3 }, emoji: '🍫' },
  { id: 'f25', name: 'Hummus', category: 'Dips', servingSize: '2 tbsp', servingGrams: 30, nutrition: { calories: 70, protein: 2, carbs: 6, fat: 5, fiber: 1 }, emoji: '🧆' },
  { id: 'f26', name: 'Trail Mix', category: 'Snacks', servingSize: '1/4 cup', servingGrams: 38, nutrition: { calories: 175, protein: 5, carbs: 16, fat: 11, fiber: 2 }, emoji: '🥜' },
  { id: 'f27', name: 'Cottage Cheese', category: 'Dairy', servingSize: '1/2 cup', servingGrams: 113, nutrition: { calories: 110, protein: 12.5, carbs: 4.5, fat: 4.5 }, emoji: '🧀' },
  { id: 'f28', name: 'Rice Cakes', category: 'Snacks', servingSize: '2 cakes', servingGrams: 18, nutrition: { calories: 70, protein: 1.4, carbs: 14.8, fat: 0.6 }, emoji: '🍘' },

  // Drinks
  { id: 'f29', name: 'Whole Milk', category: 'Dairy', servingSize: '1 cup', servingGrams: 244, nutrition: { calories: 149, protein: 8, carbs: 12, fat: 8 }, emoji: '🥛' },
  { id: 'f30', name: 'Orange Juice', category: 'Beverages', servingSize: '1 cup', servingGrams: 248, nutrition: { calories: 112, protein: 1.7, carbs: 25.8, fat: 0.5 }, emoji: '🍊' },
  { id: 'f31', name: 'Protein Shake', category: 'Beverages', servingSize: '1 scoop + water', servingGrams: 270, nutrition: { calories: 120, protein: 24, carbs: 3, fat: 1 }, emoji: '🥤' },

  // Complete meals
  { id: 'f32', name: 'Chicken Caesar Salad', category: 'Mixed', servingSize: '1 bowl', servingGrams: 350, nutrition: { calories: 440, protein: 38, carbs: 18, fat: 26 }, emoji: '🥗' },
  { id: 'f33', name: 'Burrito Bowl', category: 'Mixed', servingSize: '1 bowl', servingGrams: 450, nutrition: { calories: 580, protein: 32, carbs: 68, fat: 18, fiber: 12 }, emoji: '🌯' },
  { id: 'f34', name: 'Stir Fry w/ Rice', category: 'Mixed', servingSize: '1 plate', servingGrams: 400, nutrition: { calories: 480, protein: 28, carbs: 52, fat: 16, fiber: 5 }, emoji: '🍜' },
  { id: 'f35', name: 'Turkey Sandwich', category: 'Mixed', servingSize: '1 sandwich', servingGrams: 280, nutrition: { calories: 360, protein: 28, carbs: 38, fat: 10 }, emoji: '🥪' },
  { id: 'f36', name: 'Veggie Wrap', category: 'Mixed', servingSize: '1 wrap', servingGrams: 250, nutrition: { calories: 310, protein: 12, carbs: 42, fat: 11, fiber: 6 }, emoji: '🌮' },
];

export function searchAllFoods(allFoods: FoodItem[], query: string): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return allFoods;
  return allFoods.filter(
    f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
  );
}

export function getAllCategories(allFoods: FoodItem[]): string[] {
  return [...new Set(allFoods.map(f => f.category))];
}

export function isCustomFood(id: string): boolean {
  return id.startsWith('custom_');
}
