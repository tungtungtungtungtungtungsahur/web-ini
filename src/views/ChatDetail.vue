<template>
  <div class="chat-detail">
    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <div class="user-info">
        <img :src="receiver.avatarUrl || '/default-avatar.png'" alt="avatar" class="avatar" />
        <div class="user-details">
          <h2>{{ receiver.name }}</h2>
          <p>@{{ receiver.username }}</p>
        </div>
      </div>
    </div>

    <!-- Product Info -->
    <div v-if="productInfo" class="product-info">
      <img :src="productInfo.images?.[0] || '/placeholder.png'" alt="product" class="product-img" />
      <div class="product-details">
        <h3>{{ productInfo.name }}</h3>
        <p class="price">Rp {{ formatPrice(productInfo.price) }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <!-- Messages -->
    <div v-else class="messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id"
           :class="['message', message.senderId === currentUser?.uid ? 'sent' : 'received']">
        <div class="message-content">
          <p>{{ message.message }}</p>
          <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
          <span v-if="message.senderId === currentUser?.uid" class="status">
            {{ message.read ? '✓✓' : '✓' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <button class="location-button" @click="showLocationPicker = true" :disabled="sending">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </button>
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="Ketik pesan..."
        type="text"
        :disabled="sending"
      />
      <button @click="sendMessage" :disabled="!newMessage.trim() || sending" class="send-button">
        <svg v-if="sending" class="sending-icon" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 12 12"
              to="360 12 12"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
        <svg v-else class="send-icon" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M3 20V4L22 12L3 20ZM5 17L16.85 12L5 7V10.5L11 12L5 13.5V17Z"/>
        </svg>
      </button>
    </div>

    <!-- Location Picker Modal -->
    <div v-if="showLocationPicker" class="location-modal">
      <div class="location-modal-content">
        <div class="location-modal-header">
          <h3>Pilih Lokasi</h3>
          <button class="close-button" @click="showLocationPicker = false">×</button>
        </div>

        <div class="search-container">
          <input
            v-model="locationSearch"
            @input="searchLocations"
            placeholder="Cari lokasi..."
            type="text"
            class="location-search"
          />
          <button class="current-location-btn" @click="getCurrentLocation" :disabled="loadingMap">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
          </button>
        </div>

        <div v-if="loadingMap" class="loading-map">
          <div class="spinner"></div>
        </div>

        <div v-if="suggestions.length > 0" class="location-suggestions">
          <div v-for="suggestion in suggestions"
               :key="suggestion.place_id"
               class="suggestion-item"
               @click="selectSuggestion(suggestion)">
            <div class="suggestion-icon">🏢</div>
            <div class="suggestion-details">
              <div class="suggestion-name">{{ suggestion.display_name }}</div>
              <div class="suggestion-address">{{ suggestion.address?.road || suggestion.address?.suburb || '' }}</div>
            </div>
          </div>
        </div>

        <div id="map" class="map-container"></div>

        <div v-if="selectedLocation" class="selected-location">
          <div class="selected-location-details">
            <div class="selected-location-name">{{ selectedLocation.name }}</div>
            <div class="selected-location-address">{{ selectedLocation.address }}</div>
          </div>
          <div class="location-actions">
            <button class="cancel-button" @click="selectedLocation = null">Ubah</button>
            <button class="send-location-button" @click="sendSelectedLocation">Kirim Lokasi</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import {
  collection,
  doc,
  getDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { FirestoreError } from 'firebase/firestore'
import type { Map, Marker, LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css?inline'

interface Message {
  id: string
  senderId: string
  message: string
  timestamp: {
    toDate: () => Date
  }
  read: boolean
  isLocation?: boolean
  latitude?: number
  longitude?: number
  address?: string
}

interface User {
  id: string
  name: string
  username: string
  avatarUrl?: string
}

interface ProductInfo {
  id: string
  name: string
  price: number
  images: string[]
}

interface Location {
  name: string
  address: string
  lat: number
  lng: number
  place_id?: string
  display_name?: string
}

interface Suggestion {
  place_id: string
  display_name: string
  lat: string
  lon: string
  address?: {
    road?: string
    suburb?: string
    city?: string
    state?: string
    country?: string
  }
}

export default defineComponent({
  name: 'ChatDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const currentUser = auth.currentUser
    const messages = ref<Message[]>([])
    const newMessage = ref('')
    const receiver = ref<User>({
      id: '',
      name: '',
      username: '',
      avatarUrl: ''
    })
    const productInfo = ref<ProductInfo | null>(null)
    const chatId = ref('')
    const messagesContainer = ref<HTMLElement | null>(null)
    let unsubscribe: (() => void) | null = null
    const loading = ref(true)
    const error = ref('')
    const sending = ref(false)
    const showLocationPicker = ref(false)
    const locationSearch = ref('')
    const currentLocation = ref<Location | null>(null)
    const nearbyPlaces = ref<Location[]>([])
    const selectedLocation = ref<Location | null>(null)
    const loadingMap = ref(false)
    const locationError = ref('')
    const suggestions = ref<Suggestion[]>([])
    let map: Map | null = null
    let marker: Marker | null = null

    const formatPrice = (price: number) => {
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }

    const formatTime = (timestamp: Message['timestamp']) => {
      if (!timestamp) return ''
      const date = timestamp.toDate()
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const goBack = () => {
      router.go(-1)
    }

    const scrollToBottom = async () => {
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim() || !currentUser || sending.value) return

      sending.value = true
      const messageText = newMessage.value.trim()
      newMessage.value = ''

      const messageData = {
        senderId: currentUser.uid,
        message: messageText,
        timestamp: serverTimestamp(),
        read: false
      }

      try {
        await addDoc(collection(db, 'chats', chatId.value, 'messages'), messageData)
      } catch (err) {
        console.error('Error sending message:', err)
        error.value = 'Gagal mengirim pesan. Silakan coba lagi.'
        newMessage.value = messageText // Restore the message if sending failed
      } finally {
        sending.value = false
      }
    }

    const initMap = async () => {
      if (!map) {
        const L = await import('leaflet')
        map = L.map('map').setView([-6.2, 106.8], 13)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        map.on('click', (e: LeafletMouseEvent) => {
          const { lat, lng } = e.latlng
          updateMarker(lat, lng)
          reverseGeocode(lat, lng)
        })
      }
    }

    const updateMarker = async (lat: number, lng: number) => {
      if (!map) return

      const L = await import('leaflet')
      if (marker) {
        marker.setLatLng([lat, lng])
      } else {
        marker = L.marker([lat, lng]).addTo(map)
      }
    }

    const getCurrentLocation = async () => {
      loadingMap.value = true
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          })
        })

        const { latitude, longitude } = position.coords
        if (map) {
          map.setView([latitude, longitude], 15)
          updateMarker(latitude, longitude)
          reverseGeocode(latitude, longitude)
        }
      } catch (err) {
        console.error('Error getting location:', err)
        locationError.value = 'Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.'
      } finally {
        loadingMap.value = false
      }
    }

    const reverseGeocode = async (lat: number, lng: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        )
        const data = await response.json()

        selectedLocation.value = {
          name: data.display_name.split(',')[0],
          address: data.display_name,
          lat,
          lng
        }
      } catch (err) {
        console.error('Error reverse geocoding:', err)
      }
    }

    const searchLocations = async () => {
      if (!locationSearch.value.trim()) {
        suggestions.value = []
        return
      }

      loadingMap.value = true
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch.value)}&countrycodes=id&limit=5`
        )
        const data = await response.json()
        suggestions.value = data
      } catch (err) {
        console.error('Error searching locations:', err)
        locationError.value = 'Gagal mencari lokasi. Silakan coba lagi.'
      } finally {
        loadingMap.value = false
      }
    }

    const selectSuggestion = (suggestion: Suggestion) => {
      const lat = parseFloat(suggestion.lat)
      const lon = parseFloat(suggestion.lon)

      if (map) {
        map.setView([lat, lon], 15)
        updateMarker(lat, lon)
        selectedLocation.value = {
          name: suggestion.display_name.split(',')[0],
          address: suggestion.display_name,
          lat,
          lng: lon
        }
        suggestions.value = []
      }
    }

    const sendSelectedLocation = async () => {
      if (!selectedLocation.value || !currentUser || sending.value) return

      sending.value = true
      try {
        const locationMessage = `📍 ${selectedLocation.value.name}\n${selectedLocation.value.address}\nhttps://www.google.com/maps?q=${selectedLocation.value.lat},${selectedLocation.value.lng}`

        const messageData = {
          senderId: currentUser.uid,
          message: locationMessage,
          timestamp: serverTimestamp(),
          read: false,
          isLocation: true,
          latitude: selectedLocation.value.lat,
          longitude: selectedLocation.value.lng,
          address: selectedLocation.value.address
        }

        await addDoc(collection(db, 'chats', chatId.value, 'messages'), messageData)
        showLocationPicker.value = false
        selectedLocation.value = null
      } catch (err) {
        console.error('Error sending location:', err)
        error.value = 'Gagal mengirim lokasi. Silakan coba lagi.'
      } finally {
        sending.value = false
      }
    }

    watch(showLocationPicker, (newValue) => {
      if (newValue) {
        nextTick(() => {
          initMap()
          getCurrentLocation()
        })
      } else {
        if (map) {
          map.remove()
          map = null
          marker = null
        }
        selectedLocation.value = null
        locationSearch.value = ''
        suggestions.value = []
        locationError.value = ''
      }
    })

    const initializeChat = async () => {
      loading.value = true
      error.value = ''

      try {
        const receiverId = route.params.receiverId as string
        const productId = route.params.productId as string

        if (!receiverId) {
          throw new Error('ID penerima tidak valid')
        }

        // Get receiver info
        const receiverDoc = await getDoc(doc(db, 'users', receiverId))
        if (!receiverDoc.exists()) {
          throw new Error('Data penerima tidak ditemukan')
        }
        receiver.value = { id: receiverDoc.id, ...receiverDoc.data() } as User

        // Get product info if available
        if (productId) {
          const productDoc = await getDoc(doc(db, 'products', productId))
          if (productDoc.exists()) {
            productInfo.value = { id: productDoc.id, ...productDoc.data() } as ProductInfo
          }
        }

        // Create or get chat ID
        const users = [currentUser?.uid, receiverId].sort()
        chatId.value = `${users[0]}_${users[1]}_${productId || ''}`

        // Listen to messages
        const q = query(
          collection(db, 'chats', chatId.value, 'messages'),
          orderBy('timestamp', 'asc')
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
          messages.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Message[]
          scrollToBottom()
        }, (err: FirestoreError) => {
          console.error('Error listening to messages:', err)
          error.value = 'Gagal memuat pesan. Silakan coba lagi.'
        })
      } catch (err) {
        console.error('Error initializing chat:', err)
        error.value = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat chat'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      initializeChat()
    })

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })

    return {
      currentUser,
      messages,
      newMessage,
      receiver,
      productInfo,
      messagesContainer,
      loading,
      error,
      sending,
      formatPrice,
      formatTime,
      goBack,
      sendMessage,
      showLocationPicker,
      locationSearch,
      currentLocation,
      nearbyPlaces,
      selectedLocation,
      loadingMap,
      locationError,
      suggestions,
      searchLocations,
      getCurrentLocation,
      selectSuggestion,
      sendSelectedLocation
    }
  }
})
</script>

<style scoped>
.chat-detail {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #eee;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  margin-right: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.user-details p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.product-info {
  display: flex;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #eee;
  gap: 12px;
}

.product-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.product-details h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.price {
  margin: 0;
  font-size: 14px;
  color: #ff6b00;
  font-weight: 600;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message.sent {
  align-self: flex-end;
}

.message.received {
  align-self: flex-start;
}

.message-content {
  padding: 8px 12px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message.sent .message-content {
  background: #0084ff;
  color: white;
}

.timestamp {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  align-self: flex-end;
}

.message.sent .timestamp {
  color: rgba(255, 255, 255, 0.8);
}

.input-area {
  display: flex;
  padding: 12px;
  background: white;
  border-top: 1px solid #eee;
  gap: 8px;
  align-items: center;
}

.input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  outline: none;
  font-size: 15px;
  transition: border-color 0.2s;
}

.input-area input:focus {
  border-color: #0084ff;
}

.input-area input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-button {
  background: #0084ff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background: #0073e6;
  transform: scale(1.05);
}

.send-button:active:not(:disabled) {
  transform: scale(0.95);
}

.send-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.send-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.2s;
}

.sending-icon {
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive styles */
@media (max-width: 480px) {
  .input-area {
    padding: 8px;
  }

  .input-area input {
    padding: 10px 14px;
    font-size: 14px;
  }

  .send-button {
    width: 36px;
    height: 36px;
    min-width: 36px;
  }

  .send-icon,
  .sending-icon {
    width: 20px;
    height: 20px;
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 20px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0084ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error {
  color: #ff3b30;
  text-align: center;
  padding: 20px;
  flex: 1;
}

.status {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}

.message.sent .status {
  color: rgba(255, 255, 255, 0.8);
}

.location-button {
  background: none;
  border: none;
  color: #0084ff;
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  flex-shrink: 0;
}

.location-button:hover:not(:disabled) {
  transform: scale(1.05);
}

.location-button:active:not(:disabled) {
  transform: scale(0.95);
}

.location-button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.location-button svg {
  width: 24px;
  height: 24px;
}

@media (max-width: 480px) {
  .location-button {
    width: 36px;
    height: 36px;
    min-width: 36px;
  }

  .location-button svg {
    width: 20px;
    height: 20px;
  }
}

.location-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.location-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.location-modal-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  color: #666;
}

.search-container {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 8px;
}

.location-search {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

.location-search:focus {
  border-color: #0084ff;
}

.current-location-btn {
  background: none;
  border: none;
  color: #0084ff;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-location-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.loading-map {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-suggestions {
  max-height: 200px;
  overflow-y: auto;
  border-bottom: 1px solid #eee;
}

.suggestion-item {
  display: flex;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-icon {
  font-size: 24px;
  margin-right: 12px;
}

.suggestion-details {
  flex: 1;
}

.suggestion-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.suggestion-address {
  font-size: 14px;
  color: #666;
}

.selected-location {
  padding: 16px;
  border-top: 1px solid #eee;
}

.selected-location-details {
  margin-bottom: 16px;
}

.selected-location-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.selected-location-address {
  color: #666;
  font-size: 14px;
}

.location-actions {
  display: flex;
  gap: 8px;
}

.cancel-button {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-weight: 500;
  cursor: pointer;
}

.send-location-button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #0084ff;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.send-location-button:hover {
  background: #0073e6;
}

.map-container {
  height: 300px;
  width: 100%;
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 480px) {
  .location-modal-content {
    width: 100%;
    height: 100%;
    max-height: none;
    border-radius: 0;
  }

  .map-container {
    height: 250px;
  }
}
</style>
