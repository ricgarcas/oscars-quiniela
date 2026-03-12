import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  submissions: defineTable({
    name: v.string(),
    picks: v.record(v.string(), v.string()), // categoryId -> nominee
    submittedAt: v.number(),
  }),
  winners: defineTable({
    categoryId: v.string(),
    winner: v.string(),
  }).index("by_category", ["categoryId"]),
});
