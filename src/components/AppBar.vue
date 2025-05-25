<template>
  <div class="app-bar">
    <div class="app-bar-left" @click="goHome" style="cursor:pointer">
      <img src="/barbek2.png" alt="Logo" class="logo" />
      <h1 class="app-name">MarketPlace</h1>
    </div>
    <div class="search-container">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Cari produk..."
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch">
        <i class="fas fa-search"></i>
      </button>
    </div>
    <div class="app-bar-right">
      <div class="profile-section" @click="goToProfile">
        <img :src="userPhotoURL" alt="Profile" class="avatar" />
        <span class="greeting">Hi, {{ userName }}</span>
      </div>
      <button class="icon-btn" @click="goToMessages">
        <i class="fas fa-comment"></i>
      </button>
      <button class="icon-btn" @click="goToCart">
        <i class="fas fa-shopping-cart"></i>
      </button>
      <button class="sell-btn" @click="goToSell">Jual</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'

const router = useRouter()
const searchQuery = ref('')

const userName = ref('Dimas')
const userPhotoURL = ref('https://via.placeholder.com/40')

onMounted(() => {
  const user = auth.currentUser
  if (user) {
    userName.value = user.displayName || 'User'
    userPhotoURL.value = user.photoURL || 'https://via.placeholder.com/40'
  }
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'search',
      query: { keyword: searchQuery.value }
    })
  }
}

const goToProfile = () => {
  router.push('/akun')
}
const goToMessages = () => {
  router.push('/messages')
}
const goToCart = () => {
  router.push('/cart')
}
const goToSell = () => {
  router.push('/sell')
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.app-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 64px;
}

.app-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 40px;
  width: auto;
}

.app-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.search-container {
  flex: 1;
  max-width: 600px;
  margin: 0 24px;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.search-container input {
  flex: 1;
  border: none;
  background: none;
  padding: 8px 12px;
  font-size: 16px;
  outline: none;
}

.search-container button {
  background: none;
  border: none;
  padding: 8px 12px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.search-container button:hover {
  color: #333;
}

.app-bar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.greeting {
  font-size: 16px;
  color: #222;
  font-weight: 500;
}
.icon-btn {
  background: none;
  border: none;
  color: #222;
  font-size: 22px;
  cursor: pointer;
  margin: 0 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.icon-btn:hover {
  color: #e53935;
}
.sell-btn {
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.sell-btn:hover {
  background: #b71c1c;
}
@media (max-width: 768px) {
  .app-name {
    display: none;
  }
  .search-container {
    margin: 0 12px;
  }
  .greeting {
    display: none;
  }
}
</style>
