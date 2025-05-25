<template>
  <div class="overlay">
    <img src="/barbek2.png" alt="Logo" class="logo" />

    <div class="form-group">
      <input v-model="name" type="text" placeholder="Nama" />
    </div>

    <div class="form-group">
      <input v-model="username" type="text" placeholder="Username" />
    </div>

    <div class="form-group">
      <input v-model="email" type="email" placeholder="Email" />
    </div>

    <div class="form-group password-group">
      <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Password" />
      <span class="toggle" @click="showPassword = !showPassword">{{
        showPassword ? 'Hide' : 'Show'
      }}</span>
    </div>

    <div class="form-group">
      <input v-model="confirmPassword" type="password" placeholder="Konfirmasi Password" />
    </div>

    <p class="error" v-if="error">{{ error }}</p>

    <button class="signup-btn" @click="submitSignup" :disabled="isLoading">
      <span v-if="isLoading" class="spinner"></span>
      <span v-else>Daftar</span>
    </button>

    <p class="login-link">Sudah punya akun? <a href="/signin">Login</a></p>

    <div v-if="showSuccessModal" class="modal">
      <div class="modal-box">
        <h3>Sukses</h3>
        <p>Akun berhasil didaftarkan!</p>
        <button @click="showSuccessModal = false">OK</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { auth } from '../firebase'
import { useRouter } from 'vue-router'

export default {
  name: 'SignUpForm',
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      isLoading: false,
      showSuccessModal: false,
      showPassword: false,
    }
  },
  methods: {
    async submitSignup() {
      this.error = ''

      if (!this.name || !this.username || !this.email || !this.password || !this.confirmPassword) {
        this.error = 'Semua field harus diisi.'
        return
      }

      if (this.password !== this.confirmPassword) {
        this.error = 'Password tidak cocok.'
        return
      }

      if (this.password.length < 6) {
        this.error = 'Password minimal 6 karakter.'
        return
      }

      this.isLoading = true

      try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password)

        // Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: this.name,
        })

        this.showSuccessModal = true
        this.name = ''
        this.username = ''
        this.email = ''
        this.password = ''
        this.confirmPassword = ''

        // Redirect to signin page after successful registration
        setTimeout(() => {
          this.router.push('/signin')
        }, 2000)
      } catch (error) {
        if (error instanceof FirebaseError) {
          if (error.code === 'auth/email-already-in-use') {
            this.error = 'Email sudah terdaftar.'
          } else if (error.code === 'auth/invalid-email') {
            this.error = 'Format email tidak valid.'
          } else {
            this.error = 'Terjadi kesalahan. Silakan coba lagi.'
          }
        }
      } finally {
        this.isLoading = false
      }
    },
  },
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
  width: 120px;
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

.signup-btn {
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

.signup-btn:hover {
  background-color: #222;
}

.error {
  color: #ff6b6b;
  font-size: 13px;
  margin-bottom: 10px;
}

.login-link {
  margin-top: 18px;
  color: #bdc3c7;
  font-size: 13px;
}

.login-link a {
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

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(17, 24, 39, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-box {
  background: white;
  padding: 28px;
  border-radius: 12px;
  text-align: center;
}
</style>
