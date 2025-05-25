<template>
  <div class="account-container">
    <div class="profile-section">
      <div class="avatar-wrapper" @click="goToEditProfile">
        <img :src="photoURL" alt="Profile" class="avatar" />
        <span class="edit-icon">✏️</span>
      </div>
      <h2 class="username">{{ name }}</h2>
      <p class="handle">@{{ handle }}</p>
    </div>

    <div class="status-section">
      <div class="status-box">
        <p class="count">0</p>
        <p>Pengolahan</p>
      </div>
      <div class="status-box">
        <p class="count">0</p>
        <p>Dikirim</p>
      </div>
      <div class="status-box">
        <p class="count">1</p>
        <p>Selesai</p>
      </div>
    </div>

    <div class="menu-list">
      <div class="menu-item" @click="router.push('/katalogsaya')">
        <span>🏬 Katalog Saya</span>
        <span class="arrow">›</span>
      </div>
      <div class="menu-item" @click="router.push('/BioDataToko')">
        <span>📄 Biodata Toko</span>
        <span class="arrow">›</span>
      </div>
      <div class="menu-item" @click="router.push('/bantuan')">
        <span>❓ Bantuan</span>
        <span class="arrow">›</span>
      </div>
      <div class="menu-item" @click="signOut">
        <span>🚪 Keluar</span>
        <span class="arrow">›</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useRouter } from 'vue-router'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { ref, onMounted } from 'vue'

export default {
  name: 'MyAccount',
  setup() {
    const router = useRouter()
    const name = ref('')
    const handle = ref('')
    const photoURL = ref('https://placehold.co/100x100/pink/white?text=Profile')

    const goToEditProfile = () => {
      router.push('/editprofile')
    }

    const handleSignOut = async () => {
      try {
        await signOut(auth)
        router.push('/signin')
      } catch (error) {
        console.error('Gagal keluar:', error)
      }
    }

    onMounted(() => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const docRef = doc(db, 'users', user.uid)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            const data = docSnap.data()
            name.value = data.name || ''
            handle.value = data.username || ''
            photoURL.value = data.photoURL || photoURL.value
          }
        }
      })
    })

    return {
      router,
      goToEditProfile,
      signOut: handleSignOut,
      name,
      handle,
      photoURL,
    }
  },
}
</script>

<style scoped>
.account-container {
  background: #fdf6fa;
  min-height: 100vh;
  padding: 20px;
  font-family: sans-serif;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ccc;
}

.edit-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border-radius: 50%;
  padding: 4px;
  font-size: 14px;
  border: 1px solid #ddd;
}

.username {
  margin: 10px 0 4px;
  font-size: 20px;
  font-weight: bold;
}

.handle {
  color: gray;
  font-size: 14px;
}

.status-section {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.status-box {
  text-align: center;
}

.count {
  font-size: 18px;
  font-weight: bold;
}

.menu-list {
  margin-top: 30px;
}

.menu-item {
  padding: 15px 20px;
  background: #1a2b35;
  border-bottom: 1px solid black;
  font-size: 16px;
  color: white;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  margin-bottom: 10px;
}

.arrow {
  font-size: 18px;
  color: putih;
}

.menu-item:hover {
  background: #cce0ff; /* warna hover lebih gelap */
}
</style>
