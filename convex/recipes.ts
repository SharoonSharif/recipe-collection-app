import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all recipes for a user
export const getRecipes = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("createdBy", args.userId))
      .order("desc")
      .collect();
  },
});

// Get a single recipe
export const getRecipe = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.recipeId);
  },
});

// Create a new recipe
export const createRecipe = mutation({
  args: {
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
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, ...recipeData } = args;
    const now = Date.now();
    
    return await ctx.db.insert("recipes", {
      ...recipeData,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a recipe
export const updateRecipe = mutation({
  args: {
    recipeId: v.id("recipes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    ingredients: v.optional(v.array(v.object({
      item: v.string(),
      amount: v.string(),
      unit: v.optional(v.string()),
    }))),
    instructions: v.optional(v.array(v.string())),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    servings: v.optional(v.number()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    difficulty: v.optional(v.string()),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { recipeId, ...updates } = args;
    
    return await ctx.db.patch(recipeId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a recipe
export const deleteRecipe = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.recipeId);
  },
});

// Search recipes
export const searchRecipes = query({
  args: { 
    userId: v.string(),
    searchTerm: v.string() 
  },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("createdBy", args.userId))
      .collect();
    
    const searchLower = args.searchTerm.toLowerCase();
    
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchLower) ||
      recipe.description?.toLowerCase().includes(searchLower) ||
      recipe.ingredients.some(ing => 
        ing.item.toLowerCase().includes(searchLower)
      ) ||
      recipe.tags?.some(tag => 
        tag.toLowerCase().includes(searchLower)
      )
    );
  },
});