import type { Id } from '../../convex/_generated/dataModel'

export interface Ingredient {
  item: string
  amount: string
  unit?: string
}

export interface Recipe {
  _id: Id<"recipes">
  title: string
  description?: string
  ingredients: Ingredient[]
  instructions: string[]
  prepTime?: number
  cookTime?: number
  servings?: number
  category?: string
  tags?: string[]
  difficulty?: string
  rating?: number
  notes?: string
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface RecipeFormData {
  title: string
  description?: string
  ingredients: Ingredient[]
  instructions: string[]
  prepTime?: number
  cookTime?: number
  servings?: number
  category?: string
  tags?: string[]
  difficulty?: string
  rating?: number
  notes?: string
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export type RecipeCategory = 
  | 'Appetizer'
  | 'Main Course'
  | 'Dessert'
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snack'
  | 'Soup'
  | 'Salad'
  | 'Beverage'