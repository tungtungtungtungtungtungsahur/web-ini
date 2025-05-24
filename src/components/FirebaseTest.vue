<template>
  <div class="firebase-test">
    <h2>Firebase Connection Test</h2>
    <button @click="checkConnection" :disabled="isChecking">
      {{ isChecking ? 'Checking...' : 'Check Connection' }}
    </button>
    <p
      v-if="connectionStatus !== null"
      :class="{ success: connectionStatus, error: !connectionStatus }"
    >
      {{ connectionStatus ? '✅ Firebase is connected!' : '❌ Firebase connection failed' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { checkFirebaseConnection } from '@/firebase'

const connectionStatus = ref<boolean | null>(null)
const isChecking = ref(false)

const checkConnection = async () => {
  isChecking.value = true
  try {
    const isConnected = await checkFirebaseConnection()
    connectionStatus.value = isConnected
  } catch (error) {
    console.error('Error checking connection:', error)
    connectionStatus.value = false
  } finally {
    isChecking.value = false
  }
}
</script>

<style scoped>
.firebase-test {
  padding: 20px;
  text-align: center;
}

button {
  padding: 10px 20px;
  margin: 10px;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.success {
  color: green;
}

.error {
  color: red;
}
</style>
