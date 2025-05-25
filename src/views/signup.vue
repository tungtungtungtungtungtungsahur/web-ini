<template>
  <div class="signup-page">
    <div class="signup-card">
      <img src="/barbek2.png" alt="Logo" class="logo" />
      <h2 class="brand">barbek</h2>
      <form @submit.prevent="handleSignup" class="signup-form">
        <input type="text" v-model="nama" placeholder="Nama" required />
        <input type="text" v-model="username" placeholder="Username" required />
        <input type="email" v-model="email" placeholder="Email" required />
        <div class="password-field">
          <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Password" required />
          <span @click="showPassword = !showPassword" class="toggle-show">{{ showPassword ? 'Hide' : 'Show' }}</span>
        </div>
        <input :type="showPassword ? 'text' : 'password'" v-model="confirmPassword" placeholder="Konfirmasi Password" required />
        <button type="submit">Daftar</button>
      </form>
      <p class="login-prompt">
        Sudah punya akun? <router-link to="/signin">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Signup',
  data() {
    return {
      nama: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
    };
  },
  methods: {
    handleSignup() {
      alert('Signup berhasil!');
    },
  },
};
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  background-color: #1b2a30;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.signup-card {
  background-color: #2b3e45;
  padding: 40px 50px;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.logo {
  width: 100px;
  margin-bottom: 10px;
}

.brand {
  color: white;
  font-family: 'Comic Sans MS', cursive;
  font-size: 2rem;
  margin-bottom: 30px;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.signup-form input {
  padding: 14px;
  border: none;
  border-radius: 10px;
  background-color: #3a4d52;
  color: #fff;
  font-size: 1rem;
}

.signup-form input::placeholder {
  color: #b4c1c5;
}

.password-field {
  position: relative;
}

.toggle-show {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #b4c1c5;
  cursor: pointer;
  font-size: 0.9rem;
}

.signup-form button {
  padding: 14px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease;
}

.signup-form button:hover {
  background-color: #222;
}

.login-prompt {
  color: white;
  margin-top: 20px;
  font-size: 1rem;
}

.login-prompt a {
  color: #fff;
  font-weight: bold;
  text-decoration: underline;
}
</style>
