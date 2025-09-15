import { Clock, Users, Star, Share2, Trash2, Edit2, Printer, Utensils } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { categoryIcons, difficultyColors } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Recipe } from '@/types/recipe'

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
  onEdit?: () => void
  onDelete: () => void
  onShare: () => void
  onPrint: () => void
}

export function RecipeCard({ 
  recipe, 
  onClick, 
  onEdit,
  onDelete, 
  onShare, 
  onPrint 
}: RecipeCardProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
  const CategoryIcon = recipe.category ? categoryIcons[recipe.category as keyof typeof categoryIcons] : Utensils
  
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
          {recipe.rating && recipe.rating > 0 && (
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
              {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
              {recipe.category}
            </Badge>
          )}
          {recipe.difficulty && (
            <Badge className={cn(
              "capitalize",
              difficultyColors[recipe.difficulty as keyof typeof difficultyColors] || ''
            )}>
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

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{recipe.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 border-t flex justify-end gap-2">
        {onEdit && (
          <Button 
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="text-gray-500 hover:text-blue-600"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        )}
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
          <Printer className="w-4 h-4" />
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