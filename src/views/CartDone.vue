<template>
  <div class="cart-done-page">
    <div class="cart-container">
      <!-- Header -->
      <div class="header">
        <button class="back-btn" @click="goBack">←</button>
        <h2>Keranjang</h2>
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar">
        <span @click="goToCart" :class="{ active: false }">Proses</span>
        <span :class="{ active: true }">Selesai</span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        Loading...
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="!completedOrders.length" class="empty">
        Belum ada pesanan selesai.
      </div>

      <!-- Completed Orders List -->
      <div v-else class="orders-list">
        <div v-for="order in completedOrders" :key="order.id" class="order-card">
          <img
            class="order-image"
            :src="order.images?.[0] || 'https://via.placeholder.com/60'"
            alt="product"
          />
          <div class="order-details">
            <h3 class="order-title">{{ order.name || 'No Name' }}</h3>
            <p class="order-price">Rp {{ order.price || '-' }}</p>
            <p class="order-date">
              {{ formatDate(order.completedAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '@/firebase'

interface CompletedOrder {
  id: string
  name: string
  price: number
  images: string[]
  completedAt: Date
  seller?: {
    name: string
    avatarUrl: string
  }
}

export default defineComponent({
  name: 'CartDonePage',
  data() {
    return {
      loading: true,
      error: null as string | null,
      completedOrders: [] as CompletedOrder[]
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    goToCart() {
      this.$router.push({ name: 'cart' })
    },
    formatDate(date: Date | undefined) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    async fetchCompletedOrders() {
      try {
        this.loading = true
        this.error = null

        const auth = getAuth()
        const user = auth.currentUser

        if (!user) {
          this.error = 'Silakan login untuk melihat pesanan selesai.'
          return
        }

        const cartDoneRef = collection(db, 'users', user.uid, 'cart_done')
        const q = query(cartDoneRef, orderBy('completedAt', 'desc'))
        const snapshot = await getDocs(q)

        this.completedOrders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CompletedOrder))
      } catch (err) {
        this.error = 'Terjadi kesalahan.'
        console.error(err)
      } finally {
        this.loading = false
      }
    }
  },
  async created() {
    await this.fetchCompletedOrders()
  }
})
</script>

<style scoped>
.cart-done-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 32px 0;
  font-family: sans-serif;
  box-sizing: border-box;
}

.cart-container {
  max-width: 1000px;
  margin: 32px auto;
  padding: 0 24px 32px 24px;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 24px 0 0 0;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  margin-right: 16px;
}

h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  flex: 1;
  text-align: center;
}

.tab-bar {
  display: flex;
  justify-content: flex-start;
  gap: 48px;
  margin-bottom: 32px;
  border-bottom: 2px solid #eee;
  padding: 0;
  background: #fff;
}

.tab-bar span {
  padding: 12px 24px;
  cursor: pointer;
  color: #888;
  font-size: 16px;
  position: relative;
}

.tab-bar .active {
  color: #000;
  font-weight: bold;
}

.tab-bar .active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #111;
}

.loading, .error, .empty {
  text-align: center;
  padding: 40px;
  color: #aaa;
  font-size: 18px;
}

.error {
  color: #ff4444;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.order-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.order-details {
  flex: 1;
}

.order-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.order-price {
  margin: 0 0 4px 0;
  color: #444;
  font-size: 14px;
}

.order-date {
  margin: 0;
  color: #888;
  font-size: 12px;
}
</style>
