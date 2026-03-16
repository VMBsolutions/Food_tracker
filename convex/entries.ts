import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query('entries')
      .withIndex('by_user_date', q => q.eq('userId', userId).eq('date', date))
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query('entries')
      .filter(q => q.eq(q.field('userId'), userId))
      .collect();
  },
});

export const add = mutation({
  args: {
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
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    return ctx.db.insert('entries', {
      userId,
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { entryId: v.id('entries') },
  handler: async (ctx, { entryId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const entry = await ctx.db.get(entryId);
    if (!entry || entry.userId !== userId) throw new Error('Not found');
    await ctx.db.delete(entryId);
  },
});
