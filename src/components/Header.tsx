import { Link } from '@tanstack/react-router'
import { useUser, useDescope } from '@descope/react-sdk'
import { ChefHat, LogOut, User, Home, BookOpen } from 'lucide-react'
import { Button } from './ui/button'

export default function Header() {
  const { user, isUserLoading } = useUser()
  const sdk = useDescope()

  const handleLogout = async () => {
    try {
      await sdk?.logout()
      // Navigate to home after logout
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Don't show user info while loading
  if (isUserLoading) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <nav className="flex items-center gap-6">
            <Link 
              to="/" 
              className="flex items-center gap-2 font-bold text-xl hover:text-orange-600 transition-colors"
            >
              <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:inline bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Recipe Vault
              </span>
            </Link>
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-bold text-xl hover:text-orange-600 transition-colors"
          >
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Recipe Vault
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-4">
              <Link 
                to="/"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                activeProps={{ className: "text-orange-600" }}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link 
                to="/recipes" 
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                activeProps={{ className: "text-orange-600" }}
              >
                <BookOpen className="w-4 h-4" />
                My Recipes
              </Link>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user.name || user.email?.split('@')[0]}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
