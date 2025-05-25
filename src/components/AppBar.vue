<template>
  <div class="app-bar">
    <div class="app-bar-left" @click="goHome" style="cursor:pointer">
      <img src="/barbek2.png" alt="Logo" class="logo" />
      <h1 class="app-name">barbek</h1>
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
      <template v-if="isLoggedIn">
        <div class="profile-section" @click="toggleDropdown">
          <img :src="userPhotoURL" alt="Profile" class="avatar" @error="userPhotoURL = 'https://via.placeholder.com/40'" />
          <span class="greeting">Hi, {{ userName }}</span>
          <i class="fas fa-chevron-down dropdown-icon"></i>
          <div v-if="showDropdown" class="dropdown-menu" @click.stop>
            <button class="dropdown-item" @click="goToProfile">Profile</button>
            <button class="dropdown-item logout-btn" @click="logout">Logout</button>
          </div>
        </div>
        <button class="icon-btn" @click="goToMessages">
          <i class="fas fa-comment"></i>
          <span v-if="unreadMessages > 0" class="notification-badge">{{ unreadMessages }}</span>
        </button>
        <button class="icon-btn" @click="goToCart">
          <i class="fas fa-shopping-cart"></i>
        </button>
        <button class="sell-btn" @click="goToSell">Jual</button>
      </template>
      <template v-else>
        <button class="login-btn" @click="goToLogin">Login</button>
        <button class="signup-btn" @click="goToSignup">Signup</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

const router = useRouter()
const searchQuery = ref('')

const userName = ref('User')
const userPhotoURL = ref('https://via.placeholder.com/40')
const isLoggedIn = ref(false)
const showDropdown = ref(false)
const unreadMessages = ref(0)

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    isLoggedIn.value = !!user
    if (user) {
      userName.value = user.displayName || 'User'
      userPhotoURL.value = user.photoURL || 'https://via.placeholder.com/40'
      if (!user.displayName || !user.photoURL) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          if (data.name) userName.value = data.name
          if (data.photoURL) userPhotoURL.value = data.photoURL
        }
      }
      // Listen for unread messages
      listenForUnreadMessages(user.uid)
    } else {
      userName.value = 'User'
      userPhotoURL.value = 'https://via.placeholder.com/40'
      unreadMessages.value = 0
    }
  })
  document.addEventListener('click', closeDropdown)
})

const listenForUnreadMessages = (userId: string) => {
  const chatsRef = collection(db, 'chats')
  const q = query(chatsRef, where('participants', 'array-contains', userId))

  onSnapshot(q, (snapshot) => {
    let totalUnread = 0
    snapshot.forEach((doc) => {
      const chatData = doc.data()
      const lastMessage = chatData.lastMessage
      if (lastMessage && !lastMessage.read && lastMessage.senderId !== userId) {
        totalUnread++
      }
    })
    unreadMessages.value = totalUnread
  })
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'search',
      query: { keyword: searchQuery.value }
    })
  }
}

const goToProfile = () => {
  showDropdown.value = false
  router.push('/akun')
}
const goToMessages = () => router.push('/chats')
const goToCart = () => router.push('/cart')
const goToSell = () => router.push('/sell')
const goHome = () => router.push('/')
const goToLogin = () => router.push({ name: 'signin' })
const goToSignup = () => router.push({ name: 'signup' })

const toggleDropdown = (e) => {
  e.stopPropagation()
  showDropdown.value = !showDropdown.value
}
const closeDropdown = () => {
  showDropdown.value = false
}

const logout = async () => {
  await signOut(auth)
  showDropdown.value = false
  router.push('/')
  window.location.reload()
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
  position: relative;
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
  position: relative;
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
.login-btn, .signup-btn {
  background: #e53935;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 8px;
  transition: background 0.2s;
}
.login-btn:hover, .signup-btn:hover {
  background: #b71c1c;
}
.dropdown-icon {
  font-size: 14px;
  margin-left: 4px;
}
.dropdown-menu {
  position: absolute;
  top: 110%;
  right: 0;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  min-width: 140px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}
.dropdown-item {
  background: none;
  border: none;
  text-align: left;
  padding: 10px 20px;
  font-size: 15px;
  color: #222;
  cursor: pointer;
  transition: background 0.2s;
}
.dropdown-item:hover {
  background: #f5f5f5;
}
.logout-btn {
  color: #e53935;
  font-weight: bold;
}
.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e53935;
  color: white;
  font-size: 12px;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
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
