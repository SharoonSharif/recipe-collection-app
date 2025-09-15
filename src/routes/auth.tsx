import { createFileRoute } from '@tanstack/react-router'
import { Descope, useUser } from '@descope/react-sdk'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600">
              Sign in to access your personal recipe collection
            </p>
            {user && (
              <p className="text-green-600 mt-4">
                Logged in as: {user.email}
              </p>
            )}
          </div>
          
          <Descope
            flowId="sign-up-or-in"
            theme="light"
            onSuccess={(e) => {
              console.log('Login successful!')
              // Remove automatic navigation for now
              window.location.href = '/recipes'
            }}
            onError={(err) => {
              console.error('Authentication error:', err)
            }}
          />
        </div>
      </div>
    </div>
  )
}