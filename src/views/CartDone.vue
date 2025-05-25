<template>
  <div class="cart-done">
    <div v-if="!user" class="no-user">
      Silakan login untuk melihat pesanan selesai.
    </div>
    <div v-else>
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      <div v-else-if="!items.length" class="no-items">
        Belum ada pesanan selesai.
      </div>
      <div v-else class="items-list">
        <div v-for="item in items" :key="item.id" class="item-card">
          <div class="seller-info">
            <img
              :src="item.seller?.avatarUrl || '/default-avatar.png'"
              :alt="item.seller?.name || 'Seller'"
              class="seller-avatar"
              @error="handleImageError"
            >
            <span class="seller-name">{{ item.seller?.name || 'Unknown Seller' }}</span>
          </div>

          <div class="product-card">
            <div class="product-images">
              <img
                v-if="item.images && item.images.length"
                :src="item.images[0]"
                :alt="item.name"
                class="product-img"
                @error="handleImageError"
              >
              <div v-else class="no-image">
                <i class="fas fa-image"></i>
              </div>
            </div>
            <div class="product-details">
              <h3 class="product-title">{{ item.name || 'No Name' }}</h3>
              <p class="product-price">Rp {{ formatPrice(item.price) }}</p>
              <p class="completion-date">
                Selesai pada: {{ formatDate(item.completedAt) }}
              </p>
            </div>
          </div>

          <div class="actions">
            <button class="chat-btn" @click="startChat(item)">Chat penjual</button>
            <button class="buy-again-btn" @click="buyAgain(item)">Beli lagi</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useRouter } from 'vue-router'

interface CartDoneItem {
  id: string
  name: string
  price: number
  images: string[]
  sellerId: string
  seller?: {
    name: string
    avatarUrl?: string
  }
  completedAt: Date
}

const router = useRouter()
const user = ref(auth.currentUser)
const items = ref<CartDoneItem[]>([])
const loading = ref(true)
const error = ref('')

onMounted(() => {
  if (!user.value) return

  const q = query(
    collection(db, 'users', user.value.uid, 'cart_done'),
    orderBy('completedAt', 'desc')
  )

  const unsubscribe = onSnapshot(q,
    (snapshot) => {
      items.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CartDoneItem))
      loading.value = false
    },
    (err) => {
      console.error('Error fetching cart done items:', err)
      error.value = 'Terjadi kesalahan.'
      loading.value = false
    }
  )

  // Cleanup subscription on component unmount
  return () => unsubscribe()
})

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = '/placeholder.png'
}

const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const formatDate = (date: Date) => {
  if (!date) return 'Unknown date'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const startChat = (item: CartDoneItem) => {
  router.push({
    name: 'chat',
    params: {
      receiverId: item.sellerId
    },
    state: {
      productInfo: {
        name: item.name,
        price: item.price,
        images: item.images
      }
    }
  })
}

const buyAgain = (item: CartDoneItem) => {
  router.push({
    name: 'product-detail',
    params: {
      id: item.id
    }
  })
}
</script>

<style scoped>
.cart-done {
  padding: 16px;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.no-user,
.error,
.no-items {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
}

.item-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.seller-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.seller-name {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.product-card {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.product-images {
  position: relative;
  flex-shrink: 0;
}

.product-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.no-image {
  width: 80px;
  height: 80px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 20px;
}

.product-details {
  flex: 1;
  min-width: 0; /* Prevent text overflow */
}

.product-title {
  margin: 0 0 4px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  margin: 0 0 4px;
  color: #ff6b00;
  font-weight: bold;
  font-size: 16px;
}

.completion-date {
  margin: 0;
  color: #666;
  font-size: 12px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.chat-btn,
.buy-again-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.chat-btn {
  background: #f8f9fa;
  color: #000;
}

.chat-btn:hover {
  background: #e9ecef;
}

.buy-again-btn {
  background: #000;
  color: white;
}

.buy-again-btn:hover {
  background: #333;
}

/* Responsive styles */
@media (max-width: 480px) {
  .cart-done {
    padding: 12px;
  }

  .item-card {
    padding: 10px;
  }

  .product-img,
  .no-image {
    width: 70px;
    height: 70px;
  }

  .product-title {
    font-size: 13px;
  }

  .product-price {
    font-size: 15px;
  }

  .completion-date {
    font-size: 11px;
  }

  .chat-btn,
  .buy-again-btn {
    padding: 6px;
    font-size: 12px;
  }
}
</style>
