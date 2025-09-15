import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
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
  const { user } = useUser()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in first</h2>
          <a 
            href="/auth"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Sign In
          </a>
        </div>
      </div>
    )
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
    }
  }

  const handleDeleteRecipe = async (recipeId: Id<"recipes">) => {
    try {
      await deleteRecipe({ recipeId })
    } catch (error) {
      console.error('Failed to delete recipe:', error)
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
            Add Recipe
          </button>
        </div>

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
              onDelete={() => handleDeleteRecipe(recipe._id)}
            />
          ))}
        </div>

        {displayedRecipes.length === 0 && !showAddForm && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h3 className="text-xl font-semibold mb-2">No recipes yet!</h3>
            <p className="text-gray-600 mb-4">Start building your collection</p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
            >
              Add Your First Recipe
            </button>
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
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
          <span>{totalTime > 0 ? `${totalTime} min` : 'Quick'}</span>
          <span>{recipe.servings ? `${recipe.servings} servings` : ''}</span>
        </div>
        
        {recipe.rating && (
          <div className="mt-2">
            {'⭐'.repeat(recipe.rating)}
          </div>
        )}
      </div>
      
      <div className="px-6 pb-4">
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Delete
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
    difficulty: recipe?.difficulty || 'easy',
    rating: recipe?.rating || 0,
    notes: recipe?.notes || '',
  })

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { item: '', amount: '', unit: '' }]
    }))
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
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
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {recipe ? 'Edit Recipe' : 'Add New Recipe'}
            </h2>
            <button 
              type="button" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
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
                  className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ingredient.unit || ''}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="Ingredient"
                  value={ingredient.item}
                  onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500"
                />
              </div>
            ))}
            <button 
              type="button" 
              onClick={addIngredient}
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              + Add Ingredient
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Instructions</label>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="mb-2">
                <textarea
                  placeholder={`Step ${index + 1}`}
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows={2}
                />
              </div>
            ))}
            <button 
              type="button" 
              onClick={addInstruction}
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              + Add Step
            </button>
          </div>

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{recipe.title}</h2>
              {recipe.description && (
                <p className="text-gray-600">{recipe.description}</p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Recipe Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold">{recipe.prepTime || 0}</div>
              <div className="text-sm text-gray-600">Prep Time</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold">{recipe.cookTime || 0}</div>
              <div className="text-sm text-gray-600">Cook Time</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold">{recipe.servings || 1}</div>
              <div className="text-sm text-gray-600">Servings</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-semibold">{recipe.difficulty || 'Easy'}</div>
              <div className="text-sm text-gray-600">Difficulty</div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  <span>
                    {ingredient.amount} {ingredient.unit} {ingredient.item}
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
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Notes */}
          {recipe.notes && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Notes</h3>
              <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{recipe.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
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