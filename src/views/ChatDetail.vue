<template>
  <div class="chat-page">
    <div class="chat-detail">
      <div class="header">
        <button class="back-button" @click="goBack">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div class="user-info">
          <img :src="receiver.avatarUrl || '/default-avatar.png'" alt="avatar" class="avatar" />
          <div class="user-details">
            <h2>{{ receiver.name }}</h2>
            <p>@{{ receiver.username }}</p>
          </div>
        </div>
      </div>

      <div v-if="productInfo" class="product-info">
        <img :src="productInfo.images?.[0] || '/placeholder.png'" alt="product" class="product-img" />
        <div class="product-details">
          <h3>{{ productInfo.name }}</h3>
          <p class="price">Rp {{ formatPrice(productInfo.price) }}</p>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else class="messages" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id"
             :class="['message', message.senderId === currentUser?.uid ? 'sent' : 'received']">
          <div class="message-content">
            <p v-if="message.location">
              <a :href="message.location.mapsLink" target="_blank" rel="noopener noreferrer">
                📍 Lihat Lokasi
              </a>
            </p>
            <p v-else>{{ message.message }}</p>
            <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
            <span v-if="message.senderId === currentUser?.uid" class="status">
              {{ message.read ? '✓✓' : '✓' }}
            </span>
          </div>
        </div>
      </div>

      <div class="input-area">
        <button class="location-button" @click="toggleLocationPicker" :disabled="sending">
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

      <div v-if="showLocationPicker" class="location-modal">
        <div class="location-modal-content">
          <div class="location-modal-header">
            <h3>Pilih Lokasi</h3>
            <button class="close-button" @click="toggleLocationPicker">×</button>
          </div>

          <div class="search-section">
            <div class="search-container">
              <input
                v-model="locationSearch"
                @input="searchLocations"
                placeholder="Cari lokasi..."
                type="text"
                class="location-search"
              />
              <button class="search-button" @click="searchLocations">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
              <button class="gps-button" @click="centerOnUserLocation" title="Lokasi Saya">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                </svg>
              </button>
            </div>

            <div class="location-recommendations" v-if="!locationSearch && recommendations.length > 0">
              <div class="recommendations-header">Rekomendasi Lokasi Terdekat</div>
              <div v-for="place in recommendations" :key="place.osm_id"
                   class="recommendation-item" @click="selectLocation(place)">
                <div class="result-icon">📍</div>
                <div class="result-details">
                  <div class="result-name">{{ place.display_name }}</div>
                  <div class="result-address">{{ place.address }}</div>
                </div>
              </div>
            </div>

            <div class="search-results" v-if="locationSearch && searchResults.length > 0">
              <div v-for="place in searchResults" :key="place.osm_id"
                   class="search-result-item" @click="selectLocation(place)">
                <div class="result-icon">📍</div>
                <div class="result-details">
                  <div class="result-name">{{ place.display_name }}</div>
                  <div class="result-address">{{ place.address }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="map-section">
            <div class="map-container">
              <div id="map" class="map"></div>
            </div>
          </div>

          <div class="location-info-container" v-if="selectedLocation">
            <div class="location-info">
              <div class="location-header">
                <div class="location-icon">📍</div>
                <div class="location-details">
                  <div class="location-name">{{ selectedLocation.name || 'Lokasi yang dipilih' }}</div>
                  <div class="location-address">{{ selectedLocation.address }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="send-location-button" @click="sendLocation">
              Kirim Lokasi
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick } from 'vue'
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
  serverTimestamp,
  setDoc,
  updateDoc,
  increment
} from 'firebase/firestore'
import { FirestoreError } from 'firebase/firestore'

interface Message {
  id: string
  senderId: string
  message: string
  timestamp: {
    toDate: () => Date
  }
  read: boolean
  location?: {
    lat: number
    lng: number
    name?: string
    address?: string
    mapsLink?: string
  }
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
  lat: number
  lng: number
  name: string
  address: string
}

interface SearchResult {
  osm_id: number
  display_name: string
  address: string
  lat: string
  lon: string
}

interface Leaflet {
  map: (id: string, options: { center: [number, number]; zoom: number; zoomControl: boolean }) => LeafletMap
  tileLayer: (url: string, options: { attribution: string; maxZoom: number }) => { addTo: (map: LeafletMap) => void }
  control: {
    layers: (baseMaps: Record<string, unknown>) => { addTo: (map: LeafletMap) => void }
    zoom: (options: { position: string }) => { addTo: (map: LeafletMap) => void }
  }
  divIcon: (options: { className: string; html: string; iconSize: [number, number]; iconAnchor: [number, number] }) => unknown
  marker: (latlng: [number, number], options: { icon: unknown; draggable?: boolean; autoPan?: boolean; zIndexOffset?: number }) => LeafletMarker
}

interface LeafletMap {
  setView: (latlng: [number, number], zoom: number) => void
  on: (event: string, handler: (e: LeafletEvent) => void) => void
  remove: () => void
  getCenter: () => { lat: number; lng: number }
  invalidateSize: () => void
  addLayer: (layer: unknown) => void
  getZoom: () => number
}

interface LeafletMarker {
  setLatLng: (latlng: [number, number]) => void
  on: (event: string, handler: (e: LeafletEvent) => void) => void
  addTo: (map: LeafletMap) => void
  remove: () => void
  isDragging: () => boolean
  getLatLng: () => { lat: number; lng: number }
}

interface LeafletEvent {
  target: {
    getLatLng: () => { lat: number; lng: number }
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
    const searchResults = ref<SearchResult[]>([])
    const selectedLocation = ref<Location | null>(null)
    const map = ref<LeafletMap | null>(null)
    const searchTimeout = ref<number | null>(null)
    const mapInitialized = ref(false)
    const marker = ref<LeafletMarker | null>(null)
    const recommendations = ref<SearchResult[]>([])

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

    const initializeChat = async () => {
      loading.value = true
      error.value = ''

      try {
        const receiverId = route.params.receiverId as string
        const productId = route.params.productId as string

        if (!receiverId) {
          throw new Error('ID penerima tidak valid')
        }

        const receiverDoc = await getDoc(doc(db, 'users', receiverId))
        if (!receiverDoc.exists()) {
          throw new Error('Data penerima tidak ditemukan')
        }
        receiver.value = { id: receiverDoc.id, ...receiverDoc.data() } as User

        if (productId) {
          const productDoc = await getDoc(doc(db, 'products', productId))
          if (productDoc.exists()) {
            productInfo.value = { id: productDoc.id, ...productDoc.data() } as ProductInfo
          }
        }

        const users = [currentUser?.uid, receiverId].sort()
        const productName = productInfo.value?.name || ''
        chatId.value = users.length >= 2
          ? `${users.join('_')}_${productId || productName.hashCode()}`
          : Date.now().toString()

        const chatDoc = await getDoc(doc(db, 'chats', chatId.value))
        if (!chatDoc.exists()) {
          await setDoc(doc(db, 'chats', chatId.value), {
            participants: users,
            productInfo: productInfo.value,
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            createdAt: serverTimestamp()
          })
        }

        const q = query(
          collection(db, 'chats', chatId.value, 'messages'),
          orderBy('timestamp', 'desc')
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

    const sendMessage = async () => {
      if (!newMessage.value.trim() || !currentUser || sending.value) return

      sending.value = true
      const messageText = newMessage.value.trim()
      newMessage.value = ''

      try {
        const messageData = {
          senderId: currentUser.uid,
          receiverId: receiver.value.id,
          message: messageText,
          timestamp: serverTimestamp(),
          read: false,
          productInfo: productInfo.value
        }

        await addDoc(collection(db, 'chats', chatId.value, 'messages'), messageData)

        await updateDoc(doc(db, 'chats', chatId.value), {
          lastMessage: messageText,
          lastMessageTime: serverTimestamp()
        })
      } catch (err) {
        console.error('Error sending message:', err)
        error.value = 'Gagal mengirim pesan. Silakan coba lagi.'
        newMessage.value = messageText
      } finally {
        sending.value = false
      }
    }

    const loadRecommendations = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          })
        })

        const { latitude, longitude } = position.coords

        const nearbyResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent('Jakarta')}&countrycodes=id&limit=5&viewbox=${longitude-0.1},${latitude+0.1};${longitude+0.1},${latitude-0.1}&bounded=1`
        )
        const nearbyData = await nearbyResponse.json() as SearchResult[]

        recommendations.value = nearbyData.map((place) => ({
          osm_id: place.osm_id,
          display_name: place.display_name.split(',')[0],
          address: place.display_name,
          lat: place.lat,
          lon: place.lon
        }))

        console.log('Recommendations loaded:', recommendations.value)
      } catch (err) {
        console.error('Error loading recommendations:', err)
      }
    }

    const toggleLocationPicker = () => {
      showLocationPicker.value = !showLocationPicker.value
      if (showLocationPicker.value) {
        nextTick(() => {
          console.log("Attempting to initialize map...");
          if (!mapInitialized.value) {
            initMap()
          }
          if (route.query.fromList === 'true') {
            centerOnUserLocation()
          } else {
            loadRecommendations()
          }
        })
      }
    }

    const initMap = () => {
      if (!mapInitialized.value) {
        console.log("initMap called, mapInitialized is", mapInitialized.value);

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)

        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
          console.log("Leaflet loaded.");
          const L = (window as unknown as { L: Leaflet }).L
          const mapElement = document.getElementById('map')
          if (mapElement) {
            console.log("Map element found:", mapElement);

            mapElement.style.height = '300px'
            mapElement.style.width = '100%'

            const leafletMap = L.map('map', {
              center: [-6.2088, 106.8456],
              zoom: 15,
              zoomControl: false
            })
            map.value = leafletMap

            const googleLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
              attribution: '© Google',
              maxZoom: 20
            })
            googleLayer.addTo(leafletMap)

            const satelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
              attribution: '© Google',
              maxZoom: 20
            })

            const baseMaps = {
              "Peta": googleLayer,
              "Satelit": satelliteLayer
            }
            L.control.layers(baseMaps).addTo(leafletMap)

            L.control.zoom({
              position: 'topright'
            }).addTo(leafletMap)

            const markerIcon = L.divIcon({
              className: 'custom-marker',
              html: `
                <div class="marker-pin">
                  <svg viewBox="0 0 24 24" width="36" height="36">
                    <path fill="#ff3b30" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div class="marker-pulse"></div>
              `,
              iconSize: [64, 64],
              iconAnchor: [32, 32]
            })

            const selectedMarker = L.marker([-6.2088, 106.8456], {
              icon: markerIcon,
              draggable: true,
              autoPan: true
            })
            selectedMarker.addTo(leafletMap)
            marker.value = selectedMarker

            selectedMarker.on('dragend', async (e: LeafletEvent) => {
              const position = e.target.getLatLng()
              await updateLocationFromCoordinates(position.lat, position.lng)
            })

            mapInitialized.value = true
            leafletMap.invalidateSize()

            centerOnUserLocation()
          } else {
            console.error("Map element #map not found!");
          }
        }
        document.head.appendChild(script)
      }
    }

    const updateLocationFromCoordinates = async (lat: number, lng: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        )
        const data = await response.json()

        const address = data.address || {}
        const locationName = [
          address.road,
          address.suburb,
          address.neighbourhood,
          address.quarter
        ].filter(Boolean).join(', ') || data.display_name.split(',')[0]

        const fullAddress = [
          address.road,
          address.suburb,
          address.neighbourhood,
          address.quarter,
          address.city_district,
          address.city,
          address.state,
          address.country
        ].filter(Boolean).join(', ') || data.display_name

        selectedLocation.value = {
          lat,
          lng,
          name: locationName || 'Lokasi yang dipilih',
          address: fullAddress
        }
        console.log('Selected location updated:', selectedLocation.value)
      } catch (err) {
        console.error('Error getting location details:', err)
        selectedLocation.value = {
          lat,
          lng,
          name: 'Lokasi yang dipilih',
          address: `${lat}, ${lng}`
        }
      }
    }

    const centerOnUserLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          })
        })

        const { latitude, longitude } = position.coords
        if (map.value && marker.value) {
          map.value.setView([latitude, longitude], 15)
          marker.value.setLatLng([latitude, longitude])
          await updateLocationFromCoordinates(latitude, longitude)

          if (route.query.fromList === 'true') {
            await sendLocation()
          }
        }
      } catch (err) {
        console.error('Error getting current location:', err)
      }
    }

    const searchLocations = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }

      if (!locationSearch.value.trim()) {
        searchResults.value = []
        return
      }

      searchTimeout.value = window.setTimeout(async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              locationSearch.value
            )}&countrycodes=id&limit=5`
          )
          const data = await response.json()
          searchResults.value = data
        } catch (err) {
          console.error('Error searching locations:', err)
          error.value = 'Gagal mencari lokasi. Silakan coba lagi.'
        }
      }, 500)
    }

    const selectLocation = async (place: SearchResult) => {
      const lat = parseFloat(place.lat)
      const lon = parseFloat(place.lon)

      selectedLocation.value = {
        lat,
        lng: lon,
        name: place.display_name.split(',')[0],
        address: place.display_name
      }

      if (map.value) {
        map.value.setView([lat, lon], 15)
      }

      locationSearch.value = ''
      searchResults.value = []
    }

    const sendLocation = async () => {
      if (!currentUser) return

      sending.value = true
      try {
        let currentLat = -6.2088
        let currentLng = 106.8456

        if (marker.value) {
          const position = marker.value.getLatLng()
          currentLat = position.lat
          currentLng = position.lng
        }

        const chatRef = doc(db, 'chats', chatId.value)
        const chatDoc = await getDoc(chatRef)

        const mapsLink = `https://maps.google.com/?q=${currentLat},${currentLng}&z=15`
        const locationMessage = `📍 <a href="${mapsLink}" target="_blank" rel="noopener noreferrer">Lihat Lokasi Saya</a>`

        const messageData = {
          senderId: currentUser.uid,
          message: locationMessage,
          timestamp: serverTimestamp(),
          read: false,
          location: {
            lat: currentLat,
            lng: currentLng,
            name: selectedLocation.value?.name || 'Lokasi yang dipilih',
            address: selectedLocation.value?.address || 'Jakarta',
            mapsLink: mapsLink
          }
        }

        await addDoc(collection(db, 'chats', chatId.value, 'messages'), messageData)

        if (!chatDoc.exists()) {
          await setDoc(chatRef, {
            participants: [currentUser.uid, receiver.value.id],
            productId: route.params.productId || '',
            lastMessage: {
              message: '📍 Lokasi',
              timestamp: serverTimestamp(),
              read: false,
              senderId: currentUser.uid
            },
            unreadCount: 1
          })
        } else {
          await updateDoc(chatRef, {
            lastMessage: {
              message: '📍 Lokasi',
              timestamp: serverTimestamp(),
              read: false,
              senderId: currentUser.uid
            },
            unreadCount: increment(1)
          })
        }

        showLocationPicker.value = false
        locationSearch.value = ''
        searchResults.value = []
        selectedLocation.value = null
      } catch (err) {
        console.error('Error sending location:', err)
        error.value = 'Gagal mengirim lokasi. Silakan coba lagi.'
      } finally {
        sending.value = false
      }
    }

    onMounted(() => {
      initializeChat()
    })

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
      if (map.value) {
        map.value.remove()
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
      searchResults,
      selectedLocation,
      toggleLocationPicker,
      searchLocations,
      centerOnUserLocation,
      selectLocation,
      sendLocation,
      recommendations,
      loadRecommendations
    }
  }
})
</script>

<style scoped>
.chat-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.chat-detail {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-button {
  background: none;
  border: none;
  color: #000000;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  margin-right: 1rem;
  flex-shrink: 0;
}

.back-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.back-button:active {
  transform: scale(0.95);
}

.back-button svg {
  width: 1.5rem;
  height: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-details {
  min-width: 0;
  flex: 1;
}

.user-details h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-details p {
  margin: 0;
  font-size: 0.75rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-info {
  display: flex;
  padding: 1.25rem;
  background: #898989;
  border-bottom: 1px solid #eee;
  gap: 1.25rem;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-img {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 1rem;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.product-details {
  min-width: 0;
  flex: 1;
}

.product-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgb(0, 0, 0);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.price {
  margin: 0;
  font-size: 1.125rem;
  color: #000000;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  opacity: 0.9;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: env(safe-area-inset-bottom);
}

.message {
  max-width: 85%;
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
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem;
  margin-bottom: 8px;
  word-break: break-word;
  border: 1px solid #eee;
  color: #222;
}

.message.sent .message-content {
  background: #e3f2fd;
  color: #222;
}

.message.received .message-content {
  background: #fff;
  color: #222;
}

.message-content a {
  color: inherit;
  text-decoration: none;
}

.message-content a:hover {
  text-decoration: underline;
}

.timestamp {
  font-size: 0.625rem;
  color: #999;
  margin-top: 0.25rem;
  align-self: flex-end;
}

.message.sent .timestamp {
  color: rgba(255, 255, 255, 0.8);
}

.message.received .timestamp {
  color: #999;
}

.input-area {
  display: flex;
  padding: 0.75rem;
  background: white;
  border-top: 1px solid #eee;
  gap: 0.5rem;
  align-items: center;
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
}

.location-button {
  background: none;
  border: none;
  color: #666;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.location-button:hover:not(:disabled) {
  background-color: #f0f0f0;
}

.location-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-area input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 1.5rem;
  outline: none;
  font-size: 0.9375rem;
  transition: border-color 0.2s;
  min-width: 0;
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
  width: 2.5rem;
  height: 2.5rem;
  min-width: 2.5rem;
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
  width: 1.5rem;
  height: 1.5rem;
  transition: transform 0.2s;
}

.sending-icon {
  width: 1.5rem;
  height: 1.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 1.25rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0084ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error {
  color: #ff3b30;
  text-align: center;
  padding: 1.25rem;
  flex: 1;
  background: white;
  margin: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.status {
  font-size: 0.625rem;
  color: #999;
  margin-left: 0.25rem;
}

.message.sent .status {
  color: rgba(255, 255, 255, 0.8);
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
  padding: 1rem;
}

.location-modal-content {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 32rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.location-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

.search-section {
  margin-bottom: 16px;
}

.search-container {
  position: relative;
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.location-search {
  flex: 1;
  padding: 12px 40px 12px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

.location-search:focus {
  border-color: #0084ff;
}

.search-button {
  position: absolute;
  right: 48px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
}

.gps-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
}

.gps-button:hover {
  background: #f8f9fa;
  transform: scale(1.05);
  border-color: #0084ff;
}

.gps-button:active {
  transform: scale(0.95);
}

.gps-button svg {
  width: 24px;
  height: 24px;
  color: #0084ff;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
}

.search-result-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.result-icon {
  margin-right: 12px;
  font-size: 20px;
}

.result-details {
  flex: 1;
}

.result-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.result-address {
  font-size: 14px;
  color: #666;
}

.map-section {
  margin: 16px 0;
}

.map-container {
  position: relative;
  width: 100%;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
  background: #f8f9fa;
}

.map {
  width: 100%;
  height: 100%;
}

.location-info-container {
  margin: 16px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.location-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.location-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.location-icon {
  font-size: 24px;
  line-height: 1;
  color: #ff3b30;
}

.location-details {
  flex: 1;
}

.location-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.location-address {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.action-buttons {
  margin-top: 16px;
}

.send-location-button {
  background: #0084ff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.send-location-button:hover:not(:disabled) {
  background: #0073e6;
  transform: translateY(-1px);
}

.send-location-button:active:not(:disabled) {
  transform: translateY(0);
}

.send-location-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.custom-marker {
  position: relative;
}

.marker-pin {
  width: 64px;
  height: 64px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 6px rgba(255, 59, 48, 0.5));
  cursor: move;
}

.marker-pulse {
  width: 96px;
  height: 96px;
  background: rgba(255, 59, 48, 0.2);
  border-radius: 50%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.location-recommendations {
  margin-top: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.recommendations-header {
  padding: 12px;
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.recommendation-item:hover {
  background-color: #f5f5f5;
}

.recommendation-item:last-child {
  border-bottom: none;
}

@media (max-width: 480px) {
  .header {
    padding: 0.75rem;
  }

  .back-button {
    width: 2rem;
    height: 2rem;
  }

  .back-button svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .avatar {
    width: 2rem;
    height: 2rem;
  }

  .user-details h2 {
    font-size: 0.875rem;
  }

  .user-details p {
    font-size: 0.625rem;
  }

  .product-info {
    padding: 1rem;
    gap: 1rem;
  }

  .product-img {
    width: 3.5rem;
    height: 3.5rem;
  }

  .product-details h3 {
    font-size: 1rem;
  }

  .price {
    font-size: 1rem;
  }

  .messages {
    padding: 0.75rem;
  }

  .message {
    max-width: 90%;
  }

  .message-content {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .input-area {
    padding: 0.5rem;
  }

  .location-button,
  .send-button {
    width: 2rem;
    height: 2rem;
    min-width: 2rem;
  }

  .send-icon,
  .sending-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .input-area input {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .location-modal {
    padding: 0.5rem;
  }

  .location-content {
    max-height: 95vh;
  }

  .search-section {
    padding: 0.75rem;
  }

  .search-input {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .location-recommendations,
  .search-results {
    max-height: 10rem;
  }

  .recommendation-item,
  .search-result-item {
    padding: 0.5rem;
  }

  .result-name {
    font-size: 0.75rem;
  }

  .result-address {
    font-size: 0.625rem;
  }

  .location-info-container {
    padding: 0.75rem;
  }

  .location-info {
    padding: 0.5rem;
  }

  .action-buttons {
    padding: 0.75rem;
  }

  .send-location-button {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 360px) {
  .header {
    padding: 0.5rem;
  }

  .back-button {
    width: 1.75rem;
    height: 1.75rem;
  }

  .back-button svg {
    width: 1.125rem;
    height: 1.125rem;
  }

  .avatar {
    width: 1.75rem;
    height: 1.75rem;
  }

  .product-info {
    padding: 0.875rem;
  }

  .product-img {
    width: 3rem;
    height: 3rem;
  }

  .message-content {
    font-size: 0.75rem;
  }
}
</style>
