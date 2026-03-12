import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEADLINE = new Date("2026-03-15T17:00:00-06:00").getTime(); // 5pm CST (7pm ET)

export const submit = mutation({
  args: {
    name: v.string(),
    picks: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    if (Date.now() > DEADLINE) {
      throw new Error("Las predicciones están cerradas. ¡Suerte el próximo año!");
    }
    if (!args.name.trim()) {
      throw new Error("Necesitas poner tu nombre.");
    }
    await ctx.db.insert("submissions", {
      name: args.name.trim(),
      picks: args.picks,
      submittedAt: Date.now(),
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("submissions").order("desc").collect();
  },
});

export const getDeadline = query({
  handler: async () => {
    return DEADLINE;
  },
});
