import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEADLINE = new Date("2026-03-15T17:00:00-06:00").getTime(); // 5pm CST (7pm ET)

function createPublicToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

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
    const publicToken = createPublicToken();
    await ctx.db.insert("submissions", {
      name: args.name.trim(),
      picks: args.picks,
      submittedAt: Date.now(),
      publicToken,
    });
    return { publicToken };
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

export const getByPublicToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_public_token", (q) => q.eq("publicToken", args.token))
      .unique();
  },
});

export const ensurePublicToken = mutation({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("No se encontró la submission.");
    }

    if (submission.publicToken) {
      return { publicToken: submission.publicToken };
    }

    const publicToken = createPublicToken();
    await ctx.db.patch(args.submissionId, { publicToken });
    return { publicToken };
  },
});

export const remove = mutation({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) {
      throw new Error("No se encontró la submission.");
    }

    await ctx.db.delete(args.submissionId);
  },
});
