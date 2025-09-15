import { useState } from 'react'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useUser } from '@descope/react-sdk'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

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

function RecipesPage() {
  const { user, isUserLoading: authLoading } = useUser()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Id<"recipes"> | null>(null)

  const recipes = useQuery(api.recipes.getRecipes, 
    user ? { userId: user.userId || user.email || '' } : "skip"
  )
  
  const searchResults = useQuery(api.recipes.searchRecipes, 
    user && searchTerm ? { 
      userId: user.userId || user.email || '', 
      searchTerm 
    } : "skip"
  )

  const createRecipe = useMutation(api.recipes.createRecipe)
  const updateRecipe = useMutation(api.recipes.updateRecipe)
  const deleteRecipe = useMutation(api.recipes.deleteRecipe)

  const categories = Array.from(
    new Set((recipes || []).map(r => r.category).filter(Boolean)),
  ) as string[]

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to auth if not logged in
  if (!user) {
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
    } catch (error) {
      console.error('Failed to create recipe:', error)
      alert('Failed to create recipe. Please try again.')
    }
  }

  const handleUpdateRecipe = async (recipeId: Id<"recipes">, recipeData: RecipeFormData) => {
    try {
      await updateRecipe({ 
        recipeId, 
        ...recipeData 
      })
      setSelectedRecipe(null)
    } catch (error) {
      console.error('Failed to update recipe:', error)
      alert('Failed to update recipe. Please try again.')
    }
  }

  const handleDeleteRecipe = async (recipeId: Id<"recipes">) => {
    try {
      await deleteRecipe({ recipeId })
      setConfirmDelete(null)
    } catch (error) {
      console.error('Failed to delete recipe:', error)
      alert('Failed to delete recipe. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || user?.email || 'Chef'}!
          </h1>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            + Add Recipe
          </button>
        </div>

        {/* Stats */}
        {recipes && recipes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-orange-600">{recipes.length}</div>
              <div className="text-sm text-gray-600">Total Recipes</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-green-600">
                {recipes.filter(r => r.rating && r.rating >= 4).length}
              </div>
              <div className="text-sm text-gray-600">Top Rated</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-purple-600">
                {recipes.filter(r => r.difficulty === 'easy').length}
              </div>
              <div className="text-sm text-gray-600">Easy Recipes</div>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Search recipes, ingredients, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-48 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Recipe Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe._id} 
              recipe={recipe} 
              onClick={() => setSelectedRecipe(recipe)}
              onDelete={() => setConfirmDelete(recipe._id)}
            />
          ))}
        </div>

        {displayedRecipes.length === 0 && !showAddForm && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm || categoryFilter ? 'No recipes found' : 'No recipes yet!'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter 
                ? 'Try adjusting your search or filters' 
                : 'Start building your collection'}
            </p>
            {!searchTerm && !categoryFilter && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
              >
                Add Your First Recipe
              </button>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Delete Recipe?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this recipe? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteRecipe(confirmDelete)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
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
          />
        )}
      </div>
    </div>
  )
}

function RecipeCard({ recipe, onClick, onDelete }: { 
  recipe: Recipe
  onClick: () => void
  onDelete: () => void 
}) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
      <div onClick={onClick} className="p-6">
        <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
        {recipe.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.category && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              {recipe.category}
            </span>
          )}
          {recipe.difficulty && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {recipe.difficulty}
            </span>
          )}
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>⏱ {totalTime > 0 ? `${totalTime} min` : 'Quick'}</span>
          <span>{recipe.servings ? `🍽 ${recipe.servings} servings` : ''}</span>
        </div>
        
        {recipe.rating && (
          <div className="mt-2">
            {'⭐'.repeat(Math.min(recipe.rating, 5))}
          </div>
        )}
      </div>
      
      <div className="px-6 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Delete Recipe
        </button>
      </div>
    </div>
  )
}

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

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { item: '', amount: '', unit: '' }]
    }))
  }

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }))
  }

  const updateIngredient = (index: number, field: keyof typeof formData.ingredients[0], value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }))
  }

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      )
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      ingredients: formData.ingredients.filter(ing => ing.item.trim()),
      instructions: formData.instructions.filter(inst => inst.trim()),
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {recipe ? 'Edit Recipe' : 'Add New Recipe'}
            </h2>
            <button 
              type="button" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Ingredients</label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Amount"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                  className="w-24 px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ingredient.unit || ''}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="w-24 px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Ingredient"
                  value={ingredient.item}
                  onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                />
                {formData.ingredients.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addIngredient}
              className="text-orange-500 hover:text-orange-600 text-sm mt-2"
            >
              + Add Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Instructions</label>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="mb-2 flex gap-2">
                <textarea
                  placeholder={`Step ${index + 1}`}
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows={2}
                />
                {formData.instructions.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeInstruction(index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              onClick={addInstruction}
              className="text-orange-500 hover:text-orange-600 text-sm mt-2"
            >
              + Add Step
            </button>
          </div>

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Breakfast, Lunch, Dinner, Dessert"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Prep Time (minutes)</label>
              <input
                type="number"
                value={formData.prepTime}
                onChange={(e) => setFormData(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Cook Time (minutes)</label>
              <input
                type="number"
                value={formData.cookTime}
                onChange={(e) => setFormData(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Servings</label>
              <input
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <button 
                type="button" 
                onClick={addTag}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => removeTag(tag)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special tips or variations..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
            >
              {recipe ? 'Update Recipe' : 'Save Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RecipeDetail({ recipe, onClose, onEdit }: {
  recipe: Recipe
  onClose: () => void
  onEdit: (recipe: RecipeFormData) => void
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">{recipe.title}</h2>
              {recipe.description && (
                <p className="text-gray-600 text-lg">{recipe.description}</p>
              )}
              {recipe.rating && (
                <div className="mt-2 text-xl">
                  {'⭐'.repeat(Math.min(recipe.rating, 5))}
                </div>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Recipe Info */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 text-center">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold">{recipe.prepTime || 0} min</div>
              <div className="text-sm text-gray-600">Prep Time</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold">{recipe.cookTime || 0} min</div>
              <div className="text-sm text-gray-600">Cook Time</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold">{totalTime} min</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold">{recipe.servings || 1}</div>
              <div className="text-sm text-gray-600">Servings</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold capitalize">{recipe.difficulty || 'Easy'}</div>
              <div className="text-sm text-gray-600">Difficulty</div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
            <ul className="space-y-2 bg-gray-50 p-4 rounded-lg">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  <span>
                    <strong>{ingredient.amount}</strong> {ingredient.unit} {ingredient.item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Instructions</h3>
            <ol className="space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex">
                  <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Notes */}
          {recipe.notes && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Chef's Notes</h3>
              <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                {recipe.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end border-t pt-4">
            <button 
              onClick={() => setShowEditForm(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Edit Recipe
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}