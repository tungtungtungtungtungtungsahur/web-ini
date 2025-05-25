<template>
  <div class="chat-list">
    <div class="header">
      <h1>Pesan</h1>
    </div>

    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Cari chat..."
        @input="filterChats"
      />
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="chats.length === 0" class="empty">
      <p>Belum ada pesan</p>
    </div>

    <div v-else class="chat-items">
      <div v-for="chat in chats" :key="chat.id" class="chat-item" @click="openChat(chat)">
        <img :src="chat.otherUser.avatarUrl || '/default-avatar.png'" alt="avatar" class="avatar" />
        <div class="chat-info">
          <div class="chat-header">
            <h3>{{ chat.otherUser.name }}</h3>
            <span class="timestamp">{{ formatTime(chat.lastMessage?.timestamp) }}</span>
          </div>
          <div class="chat-preview">
            <p class="message-preview">{{ chat.lastMessage?.message || 'Belum ada pesan' }}</p>
            <span v-if="chat.unreadCount > 0" class="unread-badge">{{ chat.unreadCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  doc
} from 'firebase/firestore'

interface Chat {
  id: string
  otherUser: {
    id: string
    name: string
    username: string
    avatarUrl?: string
  }
  lastMessage?: {
    message: string
    timestamp: {
      toDate: () => Date
    }
    read: boolean
    senderId: string
  }
  unreadCount: number
}

export default defineComponent({
  name: 'ChatList',
  setup() {
    const router = useRouter()
    const currentUser = auth.currentUser
    const chats = ref<Chat[]>([])
    const loading = ref(true)
    const error = ref('')
    const searchQuery = ref('')
    let unsubscribe: (() => void) | null = null

    const filteredChats = computed(() => {
      if (!searchQuery.value) return chats.value
      const query = searchQuery.value.toLowerCase()
      return chats.value.filter(chat =>
        chat.otherUser.name.toLowerCase().includes(query) ||
        chat.lastMessage?.message.toLowerCase().includes(query)
      )
    })

    const formatTime = (timestamp: Chat['lastMessage']['timestamp']) => {
      if (!timestamp) return ''
      const date = timestamp.toDate()
      const now = new Date()
      const diff = now.getTime() - date.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (days === 0) {
        return date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })
      } else if (days === 1) {
        return 'Kemarin'
      } else if (days < 7) {
        return date.toLocaleDateString('id-ID', { weekday: 'long' })
      } else {
        return date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        })
      }
    }

    const openChat = (chat: Chat) => {
      router.push({
        name: 'ChatDetail',
        params: {
          receiverId: chat.otherUser.id
        }
      })
    }

    const filterChats = () => {
      // Filtering is handled by computed property
    }

    const initializeChats = async () => {
      if (!currentUser) {
        error.value = 'Silakan login terlebih dahulu'
        loading.value = false
        return
      }

      loading.value = true
      error.value = ''

      try {
        console.log('Setting up chat listener for user:', currentUser.uid)
        const chatsRef = collection(db, 'chats')
        const q = query(
          chatsRef,
          where('participants', 'array-contains', currentUser.uid)
        )

        unsubscribe = onSnapshot(q, async (snapshot) => {
          console.log('Chat snapshot received:', snapshot.size, 'documents')
          const chatPromises = snapshot.docs.map(async (docSnapshot) => {
            const chatData = docSnapshot.data()
            console.log('Processing chat:', docSnapshot.id, chatData)

            const otherUserId = chatData.participants.find(
              (id: string) => id !== currentUser.uid
            )
            console.log('Other user ID:', otherUserId)

            // Get other user's info
            const otherUserDoc = await getDoc(doc(db, 'users', otherUserId))
            const otherUser = otherUserDoc.exists()
              ? { id: otherUserDoc.id, ...otherUserDoc.data() }
              : undefined
            console.log('Other user data:', otherUser)

            let unreadCount = 0
            if (chatData.lastMessage && !chatData.lastMessage.read && chatData.lastMessage.senderId !== currentUser.uid) {
              unreadCount = 1
            }

            return {
              id: docSnapshot.id,
              otherUser: {
                id: otherUserId,
                name: otherUser?.name || 'Unknown User',
                username: otherUser?.username || '',
                avatarUrl: otherUser?.avatarUrl
              },
              lastMessage: chatData.lastMessage,
              unreadCount
            }
          })

          try {
            const processedChats = await Promise.all(chatPromises)
            console.log('All chats processed:', processedChats)
            // Sort chats by lastMessage timestamp
            chats.value = processedChats.sort((a, b) => {
              const timeA = a.lastMessage?.timestamp?.toDate() || new Date(0)
              const timeB = b.lastMessage?.timestamp?.toDate() || new Date(0)
              return timeB.getTime() - timeA.getTime()
            })
          } catch (err) {
            console.error('Error processing chats:', err)
            error.value = 'Gagal memproses data chat'
          }
          loading.value = false
        }, (err) => {
          console.error('Error fetching chats:', err)
          error.value = err.message || 'Gagal memuat daftar chat'
          loading.value = false
        })
      } catch (err) {
        console.error('Error setting up chat listener:', err)
        error.value = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat chat'
        loading.value = false
      }
    }

    onMounted(() => {
      initializeChats()
    })

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })

    return {
      chats,
      filteredChats,
      loading,
      error,
      searchQuery,
      formatTime,
      openChat,
      filterChats
    }
  }
})
</script>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
}

.header {
  padding: 1rem;
  background-color: #000000;
  color: white;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.search-bar {
  padding: 0.5rem 1rem;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 1.5rem;
  font-size: 1rem;
  background-color: #f0f2f5;
}

.chat-items {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-item:hover {
  background-color: #f5f5f5;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 1rem;
  object-fit: cover;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.chat-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.timestamp {
  font-size: 0.75rem;
  color: #667781;
}

.chat-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-preview {
  margin: 0;
  font-size: 0.875rem;
  color: #667781;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.unread-badge {
  background-color: #25d366;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  min-width: 1.5rem;
  text-align: center;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #075e54;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error {
  padding: 1rem;
  color: #dc3545;
  text-align: center;
}

.empty {
  padding: 2rem;
  text-align: center;
  color: #667781;
  font-size: 1rem;
}
</style>
