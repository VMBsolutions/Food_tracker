import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const get = query({
  args: {},
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;
    return ctx.db
      .query('userGoals')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();
  },
});

export const set = mutation({
  args: {
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;
    const existing = await ctx.db
      .query('userGoals')
      .withIndex('by_user', q => q.eq('userId', userId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert('userGoals', { userId, ...args });
    }
  },
});
