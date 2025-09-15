import { ChefHat, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface EmptyStateProps {
  title?: string
  description?: string
  showAction?: boolean
  onAction?: () => void
  actionLabel?: string
}

export function EmptyState({
  title = "Start Your Collection",
  description = "Add your first recipe and begin building your personal cookbook.",
  showAction = true,
  onAction,
  actionLabel = "Add Your First Recipe"
}: EmptyStateProps) {
  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
      <CardContent className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
          <ChefHat className="w-10 h-10 text-orange-500" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
        {showAction && onAction && (
          <Button 
            onClick={onAction}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}