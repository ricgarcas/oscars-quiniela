import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setWinner = mutation({
  args: {
    categoryId: v.string(),
    winner: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("winners")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { winner: args.winner });
    } else {
      await ctx.db.insert("winners", {
        categoryId: args.categoryId,
        winner: args.winner,
      });
    }
  },
});

export const getAll = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("winners").collect();
    const map: Record<string, string> = {};
    for (const w of all) {
      map[w.categoryId] = w.winner;
    }
    return map;
  },
});
