import { ChefHat } from 'lucide-react'

export function LoadingSpinner() {
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