import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema({
  ...authTables,

  entries: defineTable({
    userId: v.string(),
    foodId: v.string(),
    foodName: v.string(),
    meal: v.union(
      v.literal('breakfast'),
      v.literal('lunch'),
      v.literal('dinner'),
      v.literal('snacks'),
    ),
    servings: v.number(),
    nutrition: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
      fiber: v.optional(v.number()),
    }),
    timestamp: v.number(),
    date: v.string(), // YYYY-MM-DD
  }).index('by_user_date', ['userId', 'date']),

  customFoods: defineTable({
    userId: v.string(),
    name: v.string(),
    category: v.string(),
    servingSize: v.string(),
    servingGrams: v.number(),
    nutrition: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
      fiber: v.optional(v.number()),
    }),
    emoji: v.optional(v.string()),
  }).index('by_user', ['userId']),

  userGoals: defineTable({
    userId: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
  }).index('by_user', ['userId']),
});
