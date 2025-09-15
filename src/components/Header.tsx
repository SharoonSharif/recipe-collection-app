import { Link } from '@tanstack/react-router'
import { useUser, useDescope } from '@descope/react-sdk'

export default function Header() {
  const { user } = useUser()
  const sdk = useDescope()

  const handleLogout = async () => {
    try {
      await sdk?.logout()
      // Optionally redirect to home page
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="p-4 flex gap-4 bg-white text-black justify-between shadow-sm">
      <nav className="flex flex-row items-center">
        <div className="px-3 font-bold text-lg">
          <Link to="/" className="text-orange-600 hover:text-orange-700">
            🍳 Recipe Collection
          </Link>
        </div>

        {user && (
          <>
            <div className="px-3">
              <Link 
                to="/recipes" 
                className="hover:text-orange-600 transition-colors"
                activeProps={{ className: "text-orange-600 font-semibold" }}
              >
                My Recipes
              </Link>
            </div>
          </>
        )}
      </nav>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">
              Welcome, {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}