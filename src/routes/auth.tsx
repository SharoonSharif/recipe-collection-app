import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Descope, useUser } from '@descope/react-sdk'
import { useEffect } from 'react'
import { ChefHat, Lock, Sparkles, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  const { user, isUserLoading } = useUser()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (!isUserLoading && user) {
      navigate({ to: '/recipes' })
    }
  }, [user, isUserLoading, navigate])

  const features = [
    "🔒 Bank-level security",
    "☁️ Cloud sync across devices", 
    "✨ Beautiful recipe organization",
    "🎯 Smart search & filters",
    "📱 Mobile-friendly design",
    "⚡ Lightning-fast performance"
  ]

  // Show loading state
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden lg:block">
            <Link to="/">
              <Button variant="ghost" className="mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Recipe Vault
                </h1>
              </div>
              
              <p className="text-xl text-gray-600">
                Your personal cookbook in the cloud. Store, organize, and perfect your family recipes.
              </p>

              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Card className="border-none shadow-lg bg-gradient-to-r from-orange-100 to-amber-100">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-orange-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Did you know?</p>
                      <p className="text-sm text-gray-700">
                        The average family has over 50 recipes passed down through generations. 
                        Don't let yours get lost - preserve them digitally!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div>
            <Card className="border-none shadow-2xl bg-white/95 backdrop-blur">
              <CardHeader className="space-y-1 pb-6">
                <div className="flex items-center justify-center mb-4 lg:hidden">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
                    <ChefHat className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <CardTitle className="text-2xl text-center">
                  Welcome to Recipe Vault
                </CardTitle>
                <CardDescription className="text-center">
                  Sign in to access your personal recipe collection
                </CardDescription>
                
                {user && (
                  <div className="space-y-2">
                    <Badge className="mx-auto mt-4 bg-green-100 text-green-800 border-green-200">
                      <Lock className="w-3 h-3 mr-1" />
                      Signed in as {user.email}
                    </Badge>
                    <div className="text-center">
                      <Link to="/recipes">
                        <Button className="mt-2">
                          Go to My Recipes
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                <Descope
                  flowId="sign-up-or-in"
                  theme="light"
                  onSuccess={(e) => {
                    console.log('Authentication successful!', e)
                    // Use navigate instead of window.location
                    setTimeout(() => {
                      navigate({ to: '/recipes' })
                    }, 100)
                  }}
                  onError={(err) => {
                    console.error('Authentication error:', err)
                  }}
                />
                
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    By signing in, you agree to keep your recipes delicious
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center lg:hidden">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}