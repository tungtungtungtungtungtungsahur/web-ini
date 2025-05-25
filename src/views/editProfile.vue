<template>
    <div class="edit-profile-container">
      <div class="header">
        <button class="back-button" @click="router.back()">←</button>
        <h2>Edit Profil</h2>
      </div>
  
      <div class="content">
        <img :src="photoURL" alt="Profile" class="profile-img" />
  
        <label class="input-label">Username Baru</label>
        <input v-model="username" type="text" class="input-box" />
  
        <button class="save-button" @click="saveChanges">Simpan Perubahan</button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { useRouter } from 'vue-router'
  import { onAuthStateChanged } from 'firebase/auth'
  import { auth, db } from '../firebase'
  import { doc, getDoc, updateDoc } from 'firebase/firestore'
  import { ref, onMounted } from 'vue'
  
  export default {
    name: 'EditProfile',
    setup() {
      const router = useRouter()
      const username = ref('')
      const photoURL = ref('https://placehold.co/100x100/pink/white?text=Profile')
      const uid = ref('')
  
      onMounted(() => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            uid.value = user.uid
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
  
      const saveChanges = async () => {
        if (!uid.value) return
        const userRef = doc(db, 'users', uid.value)
        await updateDoc(userRef, {
          username: username.value,
        })
        router.back()
      }
  
      return {
        router,
        username,
        photoURL,
        saveChanges,
      }
    },
  }
  </script>
  
  <style scoped>
  .edit-profile-container {
    padding: 20px;
    background: #fff;
    min-height: 100vh;
    font-family: sans-serif;
  }
  
  .header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 30px;
  }
  
  .back-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: black;
  }
  
  h2 {
    font-size: 20px;
    font-weight: bold;
  }
  
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .profile-img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 30px;
  }
  
  .input-label {
    align-self: flex-start;
    margin-bottom: 6px;
    font-size: 14px;
    color: #5f5f5f;
  }
  
  .input-box {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: 2px solid #9c27b0;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .save-button {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    color: white;
    background-color: #1976d2;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .save-button:hover {
    background-color: #1157a2;
  }
  </style>
  