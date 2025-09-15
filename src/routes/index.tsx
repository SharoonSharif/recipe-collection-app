import { createFileRoute, Link } from '@tanstack/react-router'
import { useUser } from '@descope/react-sdk'
import { 
  ChefHat, Lock, Edit3, ArrowRight, 
  Sparkles, BookOpen, Clock, Users, Star,
  Shield, Cloud, Zap, Heart
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { user } = useUser()

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your recipes are protected with enterprise-grade security",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Edit3 className="w-6 h-6" />,
      title: "Easy Editing",
      description: "Refine recipes as you perfect your culinary skills",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud Sync",
      description: "Access your recipes from any device, anywhere",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Instant search and real-time updates",
      color: "from-orange-500 to-red-500"
    }
  ]

  const stats = [
    { number: "100%", label: "Private", icon: <Lock className="w-5 h-5" /> },
    { number: "∞", label: "Recipes", icon: <BookOpen className="w-5 h-5" /> },
    { number: "24/7", label: "Access", icon: <Clock className="w-5 h-5" /> },
    { number: "5★", label: "Rated", icon: <Star className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-none">
              <Sparkles className="w-3 h-3 mr-1" />
              Your Personal Cookbook
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
              Recipe Vault
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              The beautiful, secure home for your family recipes. 
              <span className="block mt-2">Store, organize, and perfect your culinary treasures.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <Link to="/recipes">
                  <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Open My Cookbook
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="lg" variant="outline" className="border-2">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center p-4 bg-white/60 backdrop-blur rounded-xl">
                  <div className="flex items-center gap-2 text-orange-500 mb-1">
                    {stat.icon}
                    <span className="text-2xl font-bold">{stat.number}</span>
                  </div>
                  <span className="text-sm text-gray-600">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-amber-300 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-600 text-lg">
              Powerful features designed for home cooks and food lovers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-none bg-white/80 backdrop-blur hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-orange-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg">
              Start building your recipe collection in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your free account in seconds</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg mb-2">Add Recipes</h3>
              <p className="text-gray-600">Import or create your favorite recipes</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg mb-2">Cook & Enjoy</h3>
              <p className="text-gray-600">Access anywhere, cook anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-orange-500 to-amber-500 border-none shadow-2xl">
            <CardContent className="p-12 text-center text-white">
              <ChefHat className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Cooking?
              </h2>
              <p className="text-xl mb-8 opacity-95">
                Join thousands of home chefs organizing their recipes
              </p>
              {user ? (
                <Link to="/recipes">
                  <Button size="lg" variant="secondary" className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                    <BookOpen className="w-5 h-5 mr-2" />
                    View My Recipes
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                    Start Free Today
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-white/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">Recipe Vault</span>
              <span className="text-gray-600">© 2024</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for food lovers
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}