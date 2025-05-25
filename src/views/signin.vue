<template>
  <div class="overlay">
    <img src="/barbek2.png" alt="Logo" class="logo" />

    <div class="form-group">
      <input v-model="email" type="email" placeholder="Email" />
    </div>

    <div class="form-group password-group">
      <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Password" />
      <span class="toggle" @click="togglePassword">{{
        showPassword ? 'Hide' : 'Show'
      }}</span>
    </div>

    <p class="error" v-if="errorMessage">{{ errorMessage }}</p>

    <button class="signin-btn" @click="handleSignin" :disabled="isLoading">
      <span v-if="isLoading" class="spinner"></span>
      <span v-else>Login</span>
    </button>

    <p class="signup-link">Belum punya akun? <a href="/signup">Daftar</a></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from '../firebase'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleSignin = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Email dan password wajib diisi.'
    return
  }

  isLoading.value = true

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)

    // Clear form
    email.value = ''
    password.value = ''

    // Redirect to home page after successful login
    router.push('/')
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage.value = 'Email atau password salah.'
          break
        case 'auth/invalid-email':
          errorMessage.value = 'Format email tidak valid.'
          break
        case 'auth/too-many-requests':
          errorMessage.value = 'Terlalu banyak percobaan. Silakan coba lagi nanti.'
          break
        default:
          errorMessage.value = 'Terjadi kesalahan. Silakan coba lagi.'
      }
    } else {
      errorMessage.value = 'Terjadi kesalahan. Silakan coba lagi.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;
  background-color: #1a2b35;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  overflow-y: auto;
}

.logo {
  width: 130px;
  height: auto;
  margin-bottom: 24px;
}

.form-group {
  width: 100%;
  max-width: 400px;
  margin-bottom: 16px;
  position: relative;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 20px;
  background-color: #2c3e50;
  color: white;
  font-size: 14px;
  outline: none;
}

.form-group input::placeholder {
  color: #bdc3c7;
}

.password-group .toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #bdc3c7;
  font-size: 12px;
  cursor: pointer;
}

.signin-btn {
  width: 100%;
  max-width: 400px;
  padding: 14px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
}

.signin-btn:hover {
  background-color: #222;
}

.error {
  color: #ff6b6b;
  font-size: 13px;
  margin-bottom: 10px;
}

.signup-link {
  margin-top: 18px;
  color: #bdc3c7;
  font-size: 13px;
}

.signup-link a {
  color: white;
  font-weight: bold;
  text-decoration: none;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
