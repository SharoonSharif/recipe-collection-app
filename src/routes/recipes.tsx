import { useState } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { RecipeCard } from '@/components/RecipeCard'
import { RecipeForm } from '@/components/RecipeForm'
import { RecipeDetail } from '@/components/RecipeDetail'
import { Toast } from '@/components/Toast'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { EmptyState } from '@/components/EmptyState'
import type { Recipe, RecipeFormData } from '@/types/recipe'
import { 
  ChefHat, Plus, Search, Filter, Download, Upload,
  BookOpen, Hash, Star, Award, TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/recipes')({
  component: RecipesPage,
})

function RecipesPage() {
  const { user, userId, isLoading: authLoading, isAuthenticated } = useAuth()
  const { toasts, showToast, removeToast } = useToast()
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Id<"recipes"> | null>(null)

  // Convex queries and mutations
  const recipes = useQuery(api.recipes.getRecipes, 
    userId ? { userId } : "skip"
  )
  
  const searchResults = useQuery(api.recipes.searchRecipes, 
    userId && searchTerm ? { userId, searchTerm } : "skip"
  )

  const stats = useQuery(api.recipes.getRecipeStats,
    userId ? { userId } : "skip"
  )

  const createRecipe = useMutation(api.recipes.createRecipe)
  const updateRecipe = useMutation(api.recipes.updateRecipe)
  const deleteRecipe = useMutation(api.recipes.deleteRecipe)

  // Loading state
  if (authLoading) {
    return <LoadingSpinner />
  }

  // Authentication check
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/auth" />
  }

  // Get unique categories
  const categories = Array.from(
    new Set((recipes || []).map(r => r.category).filter(Boolean)),
  ) as string[]

  // Filter recipes
  const filteredBySearch = searchTerm ? (searchResults || []) : (recipes || [])
  const displayedRecipes = categoryFilter
    ? filteredBySearch.filter(r => r.category === categoryFilter)
    : filteredBySearch

  // Recipe handlers
  const handleCreateRecipe = async (recipeData: RecipeFormData) => {
    if (!userId) {
      showToast('Authentication error. Please sign in again.', 'error')
      return
    }

    try {
      await createRecipe({ 
        ...recipeData, 
        userId
      })
      setShowAddForm(false)
      showToast('Recipe created successfully!', 'success')
    } catch (error: any) {
      console.error('Failed to create recipe:', error)
      showToast(error.message || 'Failed to create recipe', 'error')
    }
  }

  const handleUpdateRecipe = async (recipeId: Id<"recipes">, recipeData: RecipeFormData) => {
    try {
      await updateRecipe({ 
        recipeId, 
        ...recipeData 
      })
      setEditingRecipe(null)
      setSelectedRecipe(null)
      showToast('Recipe updated successfully!', 'success')
    } catch (error: any) {
      console.error('Failed to update recipe:', error)
      showToast(error.message || 'Failed to update recipe', 'error')
    }
  }

  const handleDeleteRecipe = async (recipeId: Id<"recipes">) => {
    try {
      await deleteRecipe({ recipeId })
      setConfirmDelete(null)
      showToast('Recipe deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Failed to delete recipe:', error)
      showToast(error.message || 'Failed to delete recipe', 'error')
    }
  }

  // Export recipes function
  const exportRecipes = () => {
    if (!recipes || recipes.length === 0) {
      showToast('No recipes to export', 'info')
      return
    }

    const dataToExport = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      recipesCount: recipes.length,
      recipes: recipes.map(r => ({
        title: r.title,
        description: r.description,
        ingredients: r.ingredients,
        instructions: r.instructions,
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        servings: r.servings,
        category: r.category,
        tags: r.tags,
        difficulty: r.difficulty,
        rating: r.rating,
        notes: r.notes,
      }))
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `recipe-vault-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showToast(`Exported ${recipes.length} recipes successfully!`, 'success')
  }

  // Import recipes function
  const importRecipes = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userId) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (!data.recipes || !Array.isArray(data.recipes)) {
        throw new Error('Invalid file format')
      }

      let imported = 0
      let failed = 0
      
      for (const recipe of data.recipes) {
        try {
          await createRecipe({
            ...recipe,
            userId
          })
          imported++
        } catch (error) {
          console.error('Failed to import recipe:', recipe.title, error)
          failed++
        }
      }

      showToast(
        `Imported ${imported} recipes${failed > 0 ? ` (${failed} failed)` : ''}`, 
        imported > 0 ? 'success' : 'error'
      )
      
      // Reset file input
      event.target.value = ''
    } catch (error) {
      console.error('Import failed:', error)
      showToast('Failed to import recipes. Please check the file format.', 'error')
    }
  }

  // Print recipe function
  const printRecipe = (recipe: Recipe) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${recipe.title} - Recipe</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            .info { display: flex; gap: 20px; margin: 20px 0; }
            .info-item { background: #f3f4f6; padding: 10px; border-radius: 5px; }
            ul { line-height: 1.8; }
            ol { line-height: 1.8; }
            .notes { background: #fef3c7; padding: 15px; border-radius: 5px; margin-top: 20px; }
            @media print { 
              body { margin: 0; }
              .notes { background: #fffbeb; }
            }
          </style>
        </head>
        <body>
          <h1>${recipe.title}</h1>
          ${recipe.description ? `<p>${recipe.description}</p>` : ''}
          
          <div class="info">
            ${recipe.prepTime ? `<div class="info-item"><strong>Prep:</strong> ${recipe.prepTime} min</div>` : ''}
            ${recipe.cookTime ? `<div class="info-item"><strong>Cook:</strong> ${recipe.cookTime} min</div>` : ''}
            ${totalTime > 0 ? `<div class="info-item"><strong>Total:</strong> ${totalTime} min</div>` : ''}
            ${recipe.servings ? `<div class="info-item"><strong>Servings:</strong> ${recipe.servings}</div>` : ''}
            ${recipe.difficulty ? `<div class="info-item"><strong>Difficulty:</strong> ${recipe.difficulty}</div>` : ''}
          </div>
          
          <h2>Ingredients</h2>
          <ul>
            ${recipe.ingredients.map(ing => 
              `<li><strong>${ing.amount}</strong> ${ing.unit || ''} ${ing.item}</li>`
            ).join('')}
          </ul>
          
          <h2>Instructions</h2>
          <ol>
            ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
          </ol>
          
          ${recipe.notes ? `
            <div class="notes">
              <h3>Chef's Notes</h3>
              <p>${recipe.notes}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `
    
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  // Share recipe function (copy to clipboard)
  const shareRecipe = (recipe: Recipe) => {
    const recipeText = `
${recipe.title}
${recipe.description ? '\n' + recipe.description + '\n' : ''}
⏱ Prep: ${recipe.prepTime || 0} min | Cook: ${recipe.cookTime || 0} min | Servings: ${recipe.servings || 1}

INGREDIENTS:
${recipe.ingredients.map(ing => `• ${ing.amount} ${ing.unit || ''} ${ing.item}`).join('\n')}

INSTRUCTIONS:
${recipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}
${recipe.notes ? '\n\nNOTES:\n' + recipe.notes : ''}

---
Shared from Recipe Vault 🍳
    `.trim()

    navigator.clipboard.writeText(recipeText)
    showToast('Recipe copied to clipboard!', 'success')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <ChefHat className="w-10 h-10 text-orange-500" />
                My Recipe Collection
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, <span className="font-semibold">{user?.name || user?.email}</span>! 
                {recipes && ` You have ${recipes.length} delicious ${recipes.length === 1 ? 'recipe' : 'recipes'}.`}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setShowAddForm(true)}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Recipe
              </Button>
              
              <Button
                onClick={exportRecipes}
                size="lg"
                variant="outline"
                className="shadow-md"
                disabled={!recipes || recipes.length === 0}
              >
                <Download className="w-5 h-5 mr-2" />
                Export
              </Button>
              
              <div className="relative">
                <input
                  id="import-recipes"
                  type="file"
                  accept=".json"
                  onChange={importRecipes}
                  className="hidden"
                />
                <Button
                  size="lg"
                  variant="outline"
                  className="shadow-md"
                  onClick={() => document.getElementById('import-recipes')?.click()}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && stats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-orange-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.categories}</p>
                  </div>
                  <Hash className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Top Rated</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.topRated}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Easy</p>
                    <p className="text-2xl font-bold text-green-600">{stats.easy}</p>
                  </div>
                  <Award className="w-8 h-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.thisWeek}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search recipes, ingredients, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base shadow-sm border-gray-200"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-4 h-12 rounded-md border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[180px]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipe Grid */}
        {displayedRecipes && displayedRecipes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displayedRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe._id} 
                recipe={recipe} 
                onClick={() => setSelectedRecipe(recipe)}
                onEdit={() => setEditingRecipe(recipe)}
                onDelete={() => setConfirmDelete(recipe._id)}
                onShare={() => shareRecipe(recipe)}
                onPrint={() => printRecipe(recipe)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={searchTerm || categoryFilter ? 'No recipes found' : 'Start Your Collection'}
            description={
              searchTerm || categoryFilter 
                ? 'Try adjusting your search or filters to find what you\'re looking for.' 
                : 'Add your first recipe and begin building your personal cookbook.'
            }
            showAction={!searchTerm && !categoryFilter}
            onAction={() => setShowAddForm(true)}
          />
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="max-w-sm w-full border-none shadow-2xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Delete Recipe?</h3>
                <p className="text-gray-600 mb-4">
                  This action cannot be undone. This recipe will be permanently deleted from your collection.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDeleteRecipe(confirmDelete)}
                    className="flex-1"
                  >
                    Delete Recipe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Recipe Modal */}
        {showAddForm && (
          <RecipeForm
            onClose={() => setShowAddForm(false)}
            onSave={handleCreateRecipe}
          />
        )}

        {/* Edit Recipe Modal */}
        {editingRecipe && (
          <RecipeForm
            recipe={editingRecipe}
            onClose={() => setEditingRecipe(null)}
            onSave={(recipeData) => handleUpdateRecipe(editingRecipe._id, recipeData)}
          />
        )}

        {/* Recipe Detail Modal */}
        {selectedRecipe && !editingRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            onEdit={(recipeData) => handleUpdateRecipe(selectedRecipe._id, recipeData)}
            onPrint={() => printRecipe(selectedRecipe)}
            onShare={() => shareRecipe(selectedRecipe)}
          />
        )}

        {/* Toast Notifications */}
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default RecipesPage