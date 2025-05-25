<template>
    <div class="account-container">
      <div class="profile-section">
        <div class="avatar-wrapper" @click="goToEditProfile">
          <img src="/profile.jpg" alt="Profile" class="avatar" />
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
          🏬 Katalog Saya
        </div>
        <div class="menu-item" @click="router.push('/biodatatoko')">
          📄 Biodata Toko
        </div>
        <div class="menu-item" @click="router.push('/bantuan')">
          ❓ Bantuan
        </div>
        <div class="menu-item" @click="signOut">
          🚪 Keluar
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { useRouter } from 'vue-router'
  import { signOut } from 'firebase/auth'
  import { auth } from '../firebase'
  
  export default {
    name: 'MyAccount',
    setup() {
      const router = useRouter()
  
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
  
      return {
        router,
        goToEditProfile,
        signOut: handleSignOut,
        name: 'luthfiah nazla',
        handle: 'yayaaa'
      }
    }
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
    padding: 15px;
    background: white;
    border-bottom: 1px solid #eee;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  
  .menu-item:hover {
    background: #f0f0f0;
  }
  </style>
  