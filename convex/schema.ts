import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(v.object({
      item: v.string(),
      amount: v.string(),
      unit: v.optional(v.string()),
    })),
    instructions: v.array(v.string()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    servings: v.optional(v.number()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    difficulty: v.optional(v.string()),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["createdBy"]),
});