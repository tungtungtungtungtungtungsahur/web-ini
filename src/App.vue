<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import AppBar from './components/AppBar.vue'
import { useRoute } from 'vue-router'

const isLoading = ref(true)
const route = useRoute()

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
    <div class="layout" v-else>
      <AppBar v-if="route.name !== 'akunTokoSisiPenjual'" />
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.content {
  flex: 1;
  overflow-y: auto;
  background-color: #f9f9f9;
  padding: 20px;
}

.full-width {
  padding-left: 0;
}

/* Loading spinner */
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
</style>
