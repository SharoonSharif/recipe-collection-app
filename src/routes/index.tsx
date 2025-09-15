import { createFileRoute, Link } from '@tanstack/react-router'
import { useUser } from '@descope/react-sdk'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Personal Recipe Collection
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your private vault for family recipes. Store, edit, and organize your favorite dishes in a secure, beautiful interface.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">Your family recipes stay private with secure authentication</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">✏️</div>
            <h3 className="text-xl font-semibold mb-2">Easy to Edit</h3>
            <p className="text-gray-600">Perfect your recipes as you cook and discover better methods</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Always Accessible</h3>
            <p className="text-gray-600">Access your recipes from any device, anywhere</p>
          </div>
        </div>

        <div className="text-center">
          {user ? (
            <Link 
              to="/recipes"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors inline-block"
            >
              View My Recipes
            </Link>
          ) : (
            <Link 
              to="/auth"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors inline-block"
            >
              Get Started
            </Link>
          )}
          <p className="text-sm text-gray-500 mt-4">
            {user ? 'Continue managing your recipe collection' : 'Sign in required to access your recipe collection'}
          </p>
        </div>
      </div>
    </div>
  )
}