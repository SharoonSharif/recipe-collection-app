import { useUser } from '@descope/react-sdk'

export function useAuth() {
  const { user, isUserLoading, isAuthenticated } = useUser()
  
  const getUserId = () => {
    if (!user) return null
    // Try different user ID fields in order of preference
    return user.userId || user.email || user.loginIds?.[0] || null
  }
  
  return {
    user,
    userId: getUserId(),
    isLoading: isUserLoading,
    isAuthenticated
  }
}