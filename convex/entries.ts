import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    return ctx.db
      .query('entries')
      .withIndex('by_user_date', q => q.eq('userId', userId).eq('date', date))
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;
    const entry = await ctx.db.get(entryId);
    if (!entry || entry.userId !== userId) throw new Error('Not found');
    await ctx.db.delete(entryId);
  },
});
