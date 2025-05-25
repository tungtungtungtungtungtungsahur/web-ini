<script setup lang="ts">
// No imports needed here as we're using router-view
import { ref, onMounted } from 'vue'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import MainSidebar from './components/Sidebar.vue'

const isLoading = ref(true)

onMounted(() => {
  console.log('App mounted, checking auth state...')
  onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'No user')
    isLoading.value = false
  })
})
</script>

<template>
  <div id="app">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
    <router-view v-else />
    <MainSidebar />
  </div>
</template>

<style scoped>
.app {
  font-family: Arial, sans-serif;
}

nav {
  padding: 20px;
  text-align: center;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.photo-list {
  display: flex;
  gap: 12px;
  align-items: center;
}
.photo-preview {
  width: 80px;
  height: 80px;
  border: 2px dashed #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}
.photo-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}
.add-photo {
  color: #888;
  font-size: 1.1rem;
  border-style: dashed;
}
.uploaded-photo {
  border-style: solid;
  cursor: default;
}
.remove-photo {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: background 0.2s;
}
.remove-photo:hover {
  background: #e11d48;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

</style>