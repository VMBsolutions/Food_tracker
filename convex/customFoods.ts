import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const list = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;
    const food = await ctx.db.get(id);
    if (!food || food.userId !== userId) throw new Error('Not found');
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id('customFoods') },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;
    const food = await ctx.db.get(id);
    if (!food || food.userId !== userId) throw new Error('Not found');
    await ctx.db.delete(id);
  },
});
