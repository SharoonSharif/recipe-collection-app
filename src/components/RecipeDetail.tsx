import { useState } from 'react'
import { 
  X, Clock, Users, Star, Timer, Flame, ChefHat, 
  BookOpen, Edit2, Share2, Printer, Tag, Award 
} from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { RecipeForm } from './RecipeForm'
import { cn } from '@/lib/utils'
import type { Recipe, RecipeFormData } from '@/types/recipe'

interface RecipeDetailProps {
  recipe: Recipe
  onClose: () => void
  onEdit: (recipe: RecipeFormData) => void
  onPrint: () => void
  onShare: () => void
}

export function RecipeDetail({ recipe, onClose, onEdit, onPrint, onShare }: RecipeDetailProps) {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="max-w-4xl w-full my-8 border-none shadow-2xl">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{recipe.title}</CardTitle>
              {recipe.description && (
                <CardDescription className="text-base">
                  {recipe.description}
                </CardDescription>
              )}
              {recipe.rating && recipe.rating > 0 && (
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
            {recipe.prepTime && recipe.prepTime > 0 && (
              <Card className="border-none bg-orange-50">
                <CardContent className="p-3 text-center">
                  <Timer className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <p className="text-sm text-gray-600">Prep Time</p>
                  <p className="font-semibold">{recipe.prepTime} min</p>
                </CardContent>
              </Card>
            )}
            
            {recipe.cookTime && recipe.cookTime > 0 && (
              <Card className="border-none bg-blue-50">
                <CardContent className="p-3 text-center">
                  <Flame className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-sm text-gray-600">Cook Time</p>
                  <p className="font-semibold">{recipe.cookTime} min</p>
                </CardContent>
              </Card>
            )}
            
            {totalTime > 0 && (
              <Card className="border-none bg-purple-50">
                <CardContent className="p-3 text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold">{totalTime} min</p>
                </CardContent>
              </Card>
            )}
            
            {recipe.servings && (
              <Card className="border-none bg-green-50">
                <CardContent className="p-3 text-center">
                  <Users className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-sm text-gray-600">Servings</p>
                  <p className="font-semibold">{recipe.servings}</p>
                </CardContent>
              </Card>
            )}
            
            {recipe.difficulty && (
              <Card className="border-none bg-yellow-50">
                <CardContent className="p-3 text-center">
                  <Award className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="font-semibold capitalize">{recipe.difficulty}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-500" />
              Ingredients
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

          {/* Instructions */}
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Instructions
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
                  <p className="text-gray-700 whitespace-pre-wrap">{recipe.notes}</p>
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
                <Printer className="w-4 h-4 mr-2" />
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