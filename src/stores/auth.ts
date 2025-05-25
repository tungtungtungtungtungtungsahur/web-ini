import { ref } from 'vue'
import { auth } from '../firebase'
import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'

// Create reactive state
const user = ref<User | null>(null)
const loading = ref(true)

// Initialize auth state
onAuthStateChanged(auth, (newUser) => {
  user.value = newUser
  loading.value = false
})

// Auth store functions
export const useAuth = () => {
  // Get current user
  const getCurrentUser = () => {
    return user.value
  }

  const isLoggedIn = () => {
    return !!user.value
  }

  return {
    user,
    loading,
    getCurrentUser,
    isLoggedIn
  }
}
