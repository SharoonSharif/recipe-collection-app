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
    
    // Validate required fields
    if (!args.title || !args.userId) {
      throw new Error("Title and userId are required");
    }

    // Ensure ingredients and instructions are not empty
    const ingredients = args.ingredients.filter(ing => ing.item.trim());
    const instructions = args.instructions.filter(inst => inst.trim());

    if (ingredients.length === 0) {
      throw new Error("At least one ingredient is required");
    }

    if (instructions.length === 0) {
      throw new Error("At least one instruction is required");
    }
    
    return await ctx.db.insert("recipes", {
      ...recipeData,
      ingredients,
      instructions,
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
    
    // Check if recipe exists
    const recipe = await ctx.db.get(recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    // Filter empty ingredients and instructions if provided
    if (updates.ingredients) {
      updates.ingredients = updates.ingredients.filter(ing => ing.item.trim());
      if (updates.ingredients.length === 0) {
        throw new Error("At least one ingredient is required");
      }
    }

    if (updates.instructions) {
      updates.instructions = updates.instructions.filter(inst => inst.trim());
      if (updates.instructions.length === 0) {
        throw new Error("At least one instruction is required");
      }
    }
    
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
    // Check if recipe exists
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    
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
    if (!args.searchTerm.trim()) {
      return [];
    }

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
      ) ||
      recipe.category?.toLowerCase().includes(searchLower)
    );
  },
});

// Get recipe statistics for a user
export const getRecipeStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("createdBy", args.userId))
      .collect();

    const categories = new Set(recipes.map(r => r.category).filter(Boolean));
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    return {
      total: recipes.length,
      categories: categories.size,
      topRated: recipes.filter(r => r.rating && r.rating >= 4).length,
      easy: recipes.filter(r => r.difficulty === 'easy').length,
      medium: recipes.filter(r => r.difficulty === 'medium').length,
      hard: recipes.filter(r => r.difficulty === 'hard').length,
      thisWeek: recipes.filter(r => r.createdAt > weekAgo).length,
      recentlyUpdated: recipes
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 5)
        .map(r => ({ id: r._id, title: r.title })),
    };
  },
});