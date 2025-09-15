import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '@descope/react-sdk'

export const Route = createFileRoute('/recipes')({
  component: RecipesPage,
})

function RecipesPage() {
  const { user } = useUser()

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome back, {user?.name || user?.email || 'Chef'}!
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Your recipes will appear here soon!</p>
        </div>
      </div>
    </div>
  )
}