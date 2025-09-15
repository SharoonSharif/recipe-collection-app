import { useState } from 'react'
import { X, Plus, Save } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { CATEGORIES, DIFFICULTY_LEVELS } from '@/lib/constants'
import type { Recipe, RecipeFormData } from '@/types/recipe'

interface RecipeFormProps {
  onClose: () => void
  onSave: (recipe: RecipeFormData) => void
  recipe?: Recipe
}

export function RecipeForm({ onClose, onSave, recipe }: RecipeFormProps) {
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
  const [errors, setErrors] = useState<Partial<Record<keyof RecipeFormData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RecipeFormData, string>> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Recipe name is required'
    }
    
    const validIngredients = formData.ingredients.filter(ing => ing.item.trim())
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required'
    }
    
    const validInstructions = formData.instructions.filter(inst => inst.trim())
    if (validInstructions.length === 0) {
      newErrors.instructions = 'At least one instruction is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    onSave({
      ...formData,
      ingredients: formData.ingredients.filter(ing => ing.item.trim()),
      instructions: formData.instructions.filter(inst => inst.trim()),
    })
  }

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

  const updateIngredient = (index: number, field: 'item' | 'amount' | 'unit', value: string) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index][field] = value
    setFormData(prev => ({ ...prev, ingredients: newIngredients }))
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

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...formData.instructions]
    newInstructions[index] = value
    setFormData(prev => ({ ...prev, instructions: newInstructions }))
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="max-w-4xl w-full my-8 border-none shadow-2xl">
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
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={errors.title ? 'border-red-500' : ''}
                  placeholder="Enter recipe name..."
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your recipe..."
                  rows={3}
                />
              </div>
            </div>

            {/* Ingredients Section */}
            <div>
              <Label>Ingredients *</Label>
              {errors.ingredients && (
                <p className="text-sm text-red-500 mb-2">{errors.ingredients}</p>
              )}
              <div className="space-y-2 mt-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Amount"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      className="w-24"
                    />
                    <Input
                      placeholder="Unit"
                      value={ingredient.unit || ''}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      className="w-24"
                    />
                    <Input
                      placeholder="Ingredient"
                      value={ingredient.item}
                      onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                      className="flex-1"
                    />
                    {formData.ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredient(index)}
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
                  onClick={addIngredient}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
            </div>

            {/* Instructions Section */}
            <div>
              <Label>Instructions *</Label>
              {errors.instructions && (
                <p className="text-sm text-red-500 mb-2">{errors.instructions}</p>
              )}
              <div className="space-y-2 mt-2">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex items-center justify-center w-8 h-10 bg-orange-100 text-orange-600 rounded font-semibold text-sm">
                      {index + 1}
                    </div>
                    <Textarea
                      placeholder={`Step ${index + 1}`}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    {formData.instructions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInstruction(index)}
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
                  onClick={addInstruction}
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
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    rating: Math.min(5, Math.max(0, parseInt(e.target.value) || 0))
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  min="0"
                  value={formData.prepTime}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    prepTime: Math.max(0, parseInt(e.target.value) || 0)
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="cookTime">Cook Time (min)</Label>
                <Input
                  id="cookTime"
                  type="number"
                  min="0"
                  value={formData.cookTime}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cookTime: Math.max(0, parseInt(e.target.value) || 0)
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={formData.servings}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    servings: Math.max(1, parseInt(e.target.value) || 1)
                  }))}
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add Tag
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Chef's Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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