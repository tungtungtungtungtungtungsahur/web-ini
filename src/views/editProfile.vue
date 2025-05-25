<template>
    <div class="edit-profile-container">
      <div class="header">
        <button class="back-button" @click="router.back()">←</button>
        <h2>Edit Profil</h2>
      </div>
  
      <div class="profile-pic-wrapper">
        <img :src="photoURL" alt="Profile" class="profile-pic" />
      </div>
  
      <div class="form-group">
        <label for="username">Username Baru</label>
        <input
          id="username"
          v-model="username"
          type="text"
          class="input-field"
          placeholder="Masukkan username baru"
        />
      </div>
  
      <button class="save-button" @click="updateProfile">Simpan Perubahan</button>
    </div>
  </template>
  
  <script lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { auth, db } from '../firebase'
  import { doc, getDoc, updateDoc } from 'firebase/firestore'
  import { onAuthStateChanged } from 'firebase/auth'
  
  export default {
    name: 'EditProfile',
    setup() {
      const router = useRouter()
      const username = ref('')
      const photoURL = ref('https://placehold.co/100x100')
  
      onMounted(() => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const docRef = doc(db, 'users', user.uid)
            const docSnap = await getDoc(docRef)
  
            if (docSnap.exists()) {
              const data = docSnap.data()
              username.value = data.username || ''
              photoURL.value = data.photoURL || photoURL.value
            }
          }
        })
      })
  
      const updateProfile = async () => {
        const user = auth.currentUser
        if (user) {
          const userRef = doc(db, 'users', user.uid)
          try {
            await updateDoc(userRef, {
              username: username.value,
            })
            alert('Perubahan disimpan.')
            router.push('/akun')
          } catch (error) {
            console.error('Gagal memperbarui profil:', error)
          }
        }
      }
  
      return {
        router,
        username,
        photoURL,
        updateProfile,
      }
    },
  }
  </script>
  
  <style scoped>
  .edit-profile-container {
    padding: 20px;
    font-family: sans-serif;
    background: white;
    min-height: 100vh;
  }
  
  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .back-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }
  
  .profile-pic-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
  }
  
  .profile-pic {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #ccc;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
  }
  
  label {
    margin-bottom: 6px;
    font-weight: 600;
    color: #555;
  }
  
  .input-field {
    border: 2px solid #7e57c2;
    padding: 10px;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
  }
  
  .save-button {
    width: 100%;
    background-color: #1a2b35;
    color: white;
    border: none;
    padding: 14px;
    font-size: 16px;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s ease;
  }
  
  .save-button:hover {
    background-color: #1565c0;
  }
  </style>
  