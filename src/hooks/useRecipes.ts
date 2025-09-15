import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { RecipeFormData } from '../types/recipe'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export function useRecipes() {
  const { userId } = useAuth()
  const { showToast } = useToast()
  
  const recipes = useQuery(api.recipes.getRecipes, 
    userId ? { userId } : "skip"
  )
  
  const stats = useQuery(api.recipes.getRecipeStats,
    userId ? { userId } : "skip"
  )
  
  const createRecipe = useMutation(api.recipes.createRecipe)
  const updateRecipe = useMutation(api.recipes.updateRecipe)
  const deleteRecipe = useMutation(api.recipes.deleteRecipe)
  
  const handleCreateRecipe = async (recipeData: RecipeFormData) => {
    if (!userId) {
      showToast('Please sign in to create recipes', 'error')
      return null
    }
    
    try {
      const id = await createRecipe({ ...recipeData, userId })
      showToast('Recipe created successfully!', 'success')
      return id
    } catch (error) {
      showToast('Failed to create recipe', 'error')
      console.error('Create recipe error:', error)
      return null
    }
  }
  
  const handleUpdateRecipe = async (recipeId: Id<"recipes">, recipeData: RecipeFormData) => {
    try {
      await updateRecipe({ recipeId, ...recipeData })
      showToast('Recipe updated successfully!', 'success')
      return true
    } catch (error) {
      showToast('Failed to update recipe', 'error')
      console.error('Update recipe error:', error)
      return false
    }
  }
  
  const handleDeleteRecipe = async (recipeId: Id<"recipes">) => {
    try {
      await deleteRecipe({ recipeId })
      showToast('Recipe deleted successfully!', 'success')
      return true
    } catch (error) {
      showToast('Failed to delete recipe', 'error')
      console.error('Delete recipe error:', error)
      return false
    }
  }
  
  return {
    recipes,
    stats,
    createRecipe: handleCreateRecipe,
    updateRecipe: handleUpdateRecipe,
    deleteRecipe: handleDeleteRecipe,
  }
}