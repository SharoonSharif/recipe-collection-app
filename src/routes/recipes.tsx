import { useState, useEffect } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useUser } from '@descope/react-sdk'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { 
  ChefHat, Clock, Users, Flame, Plus, Search, Filter, 
  Star, Edit2, Trash2, X, ChevronRight, BookOpen,
  Timer, Award, TrendingUp, Calendar, Tag, Hash,
  Utensils, Coffee, Pizza, Cake, Salad, Soup,
  Download, Upload, FileJson, Save, AlertCircle,
  CheckCircle, Info, Copy, Share2, PrinterIcon
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { cn } from '../lib/utils'

export const Route = createFileRoute('/recipes')({
  component: RecipesPage,
})

interface Recipe {
  _id: Id<"recipes">
  title: string
  description?: string
  ingredients: Array<{ item: string; amount: string; unit?: string }>
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

interface RecipeFormData {
  title: string
  description?: string
  ingredients: Array<{ item: string; amount: string; unit?: string }>
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

const categoryIcons: Record<string, React.ReactNode> = {
  'Breakfast': <Coffee className="w-4 h-4" />,
  'Lunch': <Salad className="w-4 h-4" />,
  'Dinner': <Utensils className="w-4 h-4" />,
  'Dessert': <Cake className="w-4 h-4" />,
  'Appetizer': <Pizza className="w-4 h-4" />,
  'Main Course': <Utensils className="w-4 h-4" />,
  'Soup': <Soup className="w-4 h-4" />,
  'Snack': <Pizza className="w-4 h-4" />,
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
}

// Toast Notification Component
function Toast({ message, type, onClose }: { 
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void 
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  }

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-bottom-5",
      colors[type]
    )}>
      {icons[type]}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

function RecipesPage() {
  const { user, isUserLoading: authLoading } = useUser()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Id<"recipes"> | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const recipes = useQuery(api.recipes.getRecipes, 
    user ? { userId: user.userId || user.email || user.loginIds?[0] || '' } : "skip"
  )
  
  const searchResults = useQuery(api.recipes.searchRecipes, 
    user && searchTerm ? { 
      userId: user.userId || user.email || user.loginIds?[0] || '', 
      searchTerm 
    } : "skip"
  )

  const createRecipe = useMutation(api.recipes.createRecipe)
  const updateRecipe = useMutation(api.recipes.updateRecipe)
  const deleteRecipe = useMutation(api.recipes.deleteRecipe)

  const categories = Array.from(
    new Set((recipes || []).map(r => r.category).filter(Boolean)),
  ) as string[]

  // Export Recipes Function
  const exportRecipes = () => {
    if (!recipes || recipes.length === 0) {
      setToast({ message: 'No recipes to export', type: 'info' })
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
    
    setToast({ message: `Exported ${recipes.length} recipes successfully!`, type: 'success' })
  }

  // Import Recipes Function
  const importRecipes = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

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
            userId: user?.userId || user?.email || user?.loginIds?[0] || ''
          })
          imported++
        } catch (error) {
          console.error('Failed to import recipe:', recipe.title, error)
          failed++
        }
      }

      setToast({ 
        message: `Imported ${imported} recipes${failed > 0 ? ` (${failed} failed)` : ''}`, 
        type: imported > 0 ? 'success' : 'error' 
      })
      
      event.target.value = ''
    } catch (error) {
      console.error('Import failed:', error)
      setToast({ message: 'Failed to import recipes. Please check the file format.', type: 'error' })
    }
  }

  // Print Recipe Function
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

  // Share Recipe Function (copy to clipboard)
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
    setToast({ message: 'Recipe copied to clipboard!', type: 'success' })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto"></div>
            <ChefHat className="absolute inset-0 m-auto w-8 h-8 text-orange-500" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your recipes...</p>
        </div>
      </div>
    )
  }

  // Authentication check
  if (!isLoading && !user) {
    return <Navigate to="/auth" />
  }

  const filteredBySearch = searchTerm ? (searchResults || []) : (recipes || [])
  const displayedRecipes = categoryFilter
    ? filteredBySearch.filter(r => r.category === categoryFilter)
    : filteredBySearch

  const handleCreateRecipe = async (recipeData: RecipeFormData) => {
    try {
      await createRecipe({ 
        ...recipeData, 
        userId: user.userId || user.email || '' 
      })
      setShowAddForm(false)
      setToast({ message: 'Recipe created successfully!', type: 'success' })
    } catch (error) {
      console.error('Failed to create recipe:', error)
      setToast({ message: 'Failed to create recipe. Please try again.', type: 'error' })
    }
  }

  const handleUpdateRecipe = async (recipeId: Id<"recipes">, recipeData: RecipeFormData) => {
    try {
      await updateRecipe({ 
        recipeId, 
        ...recipeData 
      })
      setSelectedRecipe(null)
      setToast({ message: 'Recipe updated successfully!', type: 'success' })
    } catch (error) {
      console.error('Failed to update recipe:', error)
      setToast({ message: 'Failed to update recipe. Please try again.', type: 'error' })
    }
  }

  const handleDeleteRecipe = async (recipeId: Id<"recipes">) => {
    try {
      await deleteRecipe({ recipeId })
      setConfirmDelete(null)
      setToast({ message: 'Recipe deleted successfully!', type: 'success' })
    } catch (error) {
      console.error('Failed to delete recipe:', error)
      setToast({ message: 'Failed to delete recipe. Please try again.', type: 'error' })
    }
  }

  const stats = {
    total: recipes?.length || 0,
    categories: categories.length,
    topRated: recipes?.filter(r => r.rating && r.rating >= 4).length || 0,
    easy: recipes?.filter(r => r.difficulty === 'easy').length || 0,
    thisWeek: recipes?.filter(r => {
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      return r.createdAt > weekAgo
    }).length || 0,
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
                You have {stats.total} delicious {stats.total === 1 ? 'recipe' : 'recipes'}.
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
                <label htmlFor="import-recipes">
                  <Button
                    size="lg"
                    variant="outline"
                    className="shadow-md cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById('import-recipes')?.click()
                    }}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Import
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {recipes && recipes.length > 0 && (
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe._id} 
              recipe={recipe} 
              onClick={() => setSelectedRecipe(recipe)}
              onDelete={() => setConfirmDelete(recipe._id)}
              onShare={() => shareRecipe(recipe)}
              onPrint={() => printRecipe(recipe)}
            />
          ))}
        </div>

        {/* Empty State */}
        {displayedRecipes.length === 0 && !showAddForm && (
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                <ChefHat className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                {searchTerm || categoryFilter ? 'No recipes found' : 'Start Your Collection'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || categoryFilter 
                  ? 'Try adjusting your search or filters to find what you\'re looking for.' 
                  : 'Add your first recipe and begin building your personal cookbook.'}
              </p>
              {!searchTerm && !categoryFilter && (
                <Button 
                  onClick={() => setShowAddForm(true)}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Recipe
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="max-w-sm w-full border-none shadow-2xl">
              <CardHeader>
                <CardTitle className="text-red-600">Delete Recipe?</CardTitle>
                <CardDescription>
                  This action cannot be undone. This recipe will be permanently deleted from your collection.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex gap-3">
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
              </CardFooter>
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

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            onEdit={(recipeData) => handleUpdateRecipe(selectedRecipe._id, recipeData)}
            onPrint={() => printRecipe(selectedRecipe)}
            onShare={() => shareRecipe(selectedRecipe)}
          />
        )}

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  )
}

// Recipe Card Component
function RecipeCard({ recipe, onClick, onDelete, onShare, onPrint }: { 
  recipe: Recipe
  onClick: () => void
  onDelete: () => void
  onShare: () => void
  onPrint: () => void
}) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
  const categoryIcon = categoryIcons[recipe.category || ''] || <Utensils className="w-4 h-4" />
  
  return (
    <Card 
      className="group cursor-pointer border-none shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/90 backdrop-blur overflow-hidden"
      onClick={onClick}
    >
      <div className="h-2 bg-gradient-to-r from-orange-400 to-amber-400" />
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl line-clamp-1 group-hover:text-orange-600 transition-colors">
            {recipe.title}
          </CardTitle>
          {recipe.rating && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-semibold">{recipe.rating}</span>
            </div>
          )}
        </div>
        {recipe.description && (
          <CardDescription className="line-clamp-2">
            {recipe.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {recipe.category && (
            <Badge variant="secondary" className="gap-1">
              {categoryIcon}
              {recipe.category}
            </Badge>
          )}
          {recipe.difficulty && (
            <Badge className={cn("capitalize", difficultyColors[recipe.difficulty as keyof typeof difficultyColors] || '')}>
              {recipe.difficulty}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {totalTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{totalTime} min</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recipe.servings}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 border-t flex justify-end gap-2">
        <Button 
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onShare()
          }}
          className="text-gray-500 hover:text-blue-600"
        >
          <Share2 className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onPrint()
          }}
          className="text-gray-500 hover:text-green-600"
        >
          <PrinterIcon className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// Recipe Form Component (Keep the same as before)
function RecipeForm({ onClose, onSave, recipe }: {
  onClose: () => void
  onSave: (recipe: RecipeFormData) => void
  recipe?: Recipe
}) {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: recipe?.title || '',
    description: recipe?.description || '',
    ingredients: recipe?.ingredients || [{ item: '', amount: '', unit: '' }],
    instructions: recipe?.instructions || [''],
    prepTime: recipe?.prepTime || 0,
    cookTime: recipe?.cookTime || 0,
    servings: recipe?.servings || 1,
    category: recipe?.category || '',
    tags: recipe?.tags || [],
    difficulty: recipe?.difficulty || 'easy',
    rating: recipe?.rating || 0,
    notes: recipe?.notes || '',
  })

  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      ingredients: formData.ingredients.filter(ing => ing.item.trim()),
      instructions: formData.instructions.filter(inst => inst.trim()),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader className="sticky top-0 bg-white z-10 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">
                {recipe ? 'Edit Recipe' : 'Create New Recipe'}
              </CardTitle>
              <Button 
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Recipe Name *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                  placeholder="Enter recipe name..."
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  placeholder="Brief description of your recipe..."
                  rows={3}
                />
              </div>
            </div>

            {/* Ingredients Section */}
            <div>
              <Label>Ingredients List</Label>
              <div className="space-y-2 mt-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Amount"
                      value={ingredient.amount}
                      onChange={(e) => {
                        const newIngredients = [...formData.ingredients]
                        newIngredients[index].amount = e.target.value
                        setFormData(prev => ({ ...prev, ingredients: newIngredients }))
                      }}
                      className="w-24"
                    />
                    <Input
                      placeholder="Unit"
                      value={ingredient.unit || ''}
                      onChange={(e) => {
                        const newIngredients = [...formData.ingredients]
                        newIngredients[index].unit = e.target.value
                        setFormData(prev => ({ ...prev, ingredients: newIngredients }))
                      }}
                      className="w-24"
                    />
                    <Input
                      placeholder="Ingredient"
                      value={ingredient.item}
                      onChange={(e) => {
                        const newIngredients = [...formData.ingredients]
                        newIngredients[index].item = e.target.value
                        setFormData(prev => ({ ...prev, ingredients: newIngredients }))
                      }}
                      className="flex-1"
                    />
                    {formData.ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            ingredients: prev.ingredients.filter((_, i) => i !== index)
                          }))
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      ingredients: [...prev.ingredients, { item: '', amount: '', unit: '' }]
                    }))
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
            </div>

            {/* Cooking Instructions Section */}
            <div>
              <Label>Cooking Instructions</Label>
              <div className="space-y-2 mt-2">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex items-center justify-center w-8 h-10 bg-orange-100 text-orange-600 rounded font-semibold text-sm">
                      {index + 1}
                    </div>
                    <Textarea
                      placeholder={`Step ${index + 1}`}
                      value={instruction}
                      onChange={(e) => {
                        const newInstructions = [...formData.instructions]
                        newInstructions[index] = e.target.value
                        setFormData(prev => ({ ...prev, instructions: newInstructions }))
                      }}
                      className="flex-1"
                      rows={2}
                    />
                    {formData.instructions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            instructions: prev.instructions.filter((_, i) => i !== index)
                          }))
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      instructions: [...prev.instructions, '']
                    }))
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select category</option>
                  <option value="Appetizer">Appetizer</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                  <option value="Soup">Soup</option>
                  <option value="Salad">Salad</option>
                  <option value="Beverage">Beverage</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="cookTime">Cook Time (min)</Label>
                <Input
                  id="cookTime"
                  type="number"
                  value={formData.cookTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Chef's Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1"
                placeholder="Any special tips, variations, or family secrets..."
                rows={3}
              />
            </div>
          </CardContent>
          
          <CardFooter className="sticky bottom-0 bg-white border-t p-6">
            <div className="flex gap-3 ml-auto">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                <Save className="w-4 h-4 mr-2" />
                {recipe ? 'Update Recipe' : 'Save Recipe'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

// Recipe Detail Component
function RecipeDetail({ recipe, onClose, onEdit, onPrint, onShare }: {
  recipe: Recipe
  onClose: () => void
  onEdit: (recipe: RecipeFormData) => void
  onPrint: () => void
  onShare: () => void
}) {
  const [showEditForm, setShowEditForm] = useState(false)

  if (showEditForm) {
    return (
      <RecipeForm
        recipe={recipe}
        onClose={() => setShowEditForm(false)}
        onSave={(recipeData) => {
          onEdit(recipeData)
          setShowEditForm(false)
        }}
      />
    )
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{recipe.title}</CardTitle>
              {recipe.description && (
                <CardDescription className="text-base">
                  {recipe.description}
                </CardDescription>
              )}
              {recipe.rating && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < recipe.rating! ? "text-yellow-500 fill-current" : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Recipe Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="border-none bg-orange-50">
              <CardContent className="p-3 text-center">
                <Timer className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                <p className="text-sm text-gray-600">Prep Time</p>
                <p className="font-semibold">{recipe.prepTime || 0} min</p>
              </CardContent>
            </Card>
            
            <Card className="border-none bg-blue-50">
              <CardContent className="p-3 text-center">
                <Flame className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <p className="text-sm text-gray-600">Cook Time</p>
                <p className="font-semibold">{recipe.cookTime || 0} min</p>
              </CardContent>
            </Card>
            
            <Card className="border-none bg-purple-50">
              <CardContent className="p-3 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold">{totalTime} min</p>
              </CardContent>
            </Card>
            
            <Card className="border-none bg-green-50">
              <CardContent className="p-3 text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-green-600" />
                <p className="text-sm text-gray-600">Servings</p>
                <p className="font-semibold">{recipe.servings || 1}</p>
              </CardContent>
            </Card>
            
            <Card className="border-none bg-yellow-50">
              <CardContent className="p-3 text-center">
                <Award className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                <p className="text-sm text-gray-600">Difficulty</p>
                <p className="font-semibold capitalize">{recipe.difficulty || 'Easy'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-500" />
              Ingredients List
            </h3>
            <Card className="border-none bg-orange-50/50">
              <CardContent className="p-4">
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span>
                        <strong className="font-semibold">{ingredient.amount}</strong>
                        {ingredient.unit && ` ${ingredient.unit}`} {ingredient.item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Cooking Instructions */}
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Cooking Instructions
            </h3>
            <div className="space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 pt-1">{instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {recipe.notes && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Chef's Notes</h3>
              <Card className="border-none bg-yellow-50 border-l-4 border-yellow-400">
                <CardContent className="p-4">
                  <p className="text-gray-700">{recipe.notes}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t p-6">
          <div className="flex gap-3 w-full justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={onPrint}
              >
                <PrinterIcon className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowEditForm(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Recipe
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default RecipesPage