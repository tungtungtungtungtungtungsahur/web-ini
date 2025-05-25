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
  serverTimestamp
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
      sendMessage
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
</style>
