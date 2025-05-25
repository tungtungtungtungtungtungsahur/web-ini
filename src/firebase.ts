import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCwycpFAvL0lyqO8WMllMTLVG9ZBWXeb4o',
  authDomain: 'barbek-f1c69.firebaseapp.com',
  databaseURL: 'https://barbek-f1c69-default-rtdb.firebaseio.com',
  projectId: 'barbek-f1c69',
  storageBucket: 'barbek-f1c69.firebasestorage.app',
  messagingSenderId: '706194773055',
  appId: '1:706194773055:web:a95899c526ac68d9ad948a',
  measurementId: 'G-ZWSR19WMYF',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Function to check Firebase connection
export const checkFirebaseConnection = async () => {
  try {
    // Try to get the current user (this will work even if no user is logged in)
    await auth.currentUser
    console.log('Firebase is connected successfully!')
    return true
  } catch (error) {
    console.error('Firebase connection error:', error)
    return false
  }
}

export default app
