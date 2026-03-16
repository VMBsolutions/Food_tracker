import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

export const list = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query('customFoods')
      .withIndex('by_user', q => q.eq('userId', userId))
      .collect();
  },
});

export const add = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    return ctx.db.insert('customFoods', { userId, ...args });
  },
});

export const update = mutation({
  args: {
    id: v.id('customFoods'),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    servingSize: v.optional(v.string()),
    servingGrams: v.optional(v.number()),
    nutrition: v.optional(v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
      fiber: v.optional(v.number()),
    })),
    emoji: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const food = await ctx.db.get(id);
    if (!food || food.userId !== userId) throw new Error('Not found');
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id('customFoods') },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const food = await ctx.db.get(id);
    if (!food || food.userId !== userId) throw new Error('Not found');
    await ctx.db.delete(id);
  },
});
