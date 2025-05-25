<template>
  <div class="home">
    <h1>Welcome to Home Page</h1>
    <p>You are successfully logged in!</p>
    <button @click="signOut" class="signout-btn">Sign Out</button>
  </div>
</template>

<script lang="ts">
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useRouter } from 'vue-router'

export default {
  name: 'HomePage',
  setup() {
    const router = useRouter()
    return { router }
  },
  methods: {
    async signOut() {
      try {
        await signOut(auth)
        this.router.push('/signin')
      } catch (error) {
        console.error('Error signing out:', error)
      }
    },
  },
}
</script>

<style scoped>
.home {
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin-bottom: 2rem;
}

.signout-btn {
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.signout-btn:hover {
  background-color: #c82333;
}
</style>
