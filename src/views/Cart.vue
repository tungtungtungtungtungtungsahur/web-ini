<template>
  <div class="cart-page">
    <div class="cart-container">
      <!-- Header -->
      <div class="header">
        <button class="back-btn" @click="goBack">←</button>
        <h2>Keranjang</h2>
        <span class="edit-btn" @click="toggleEdit">{{ isEdit ? 'Selesai' : 'Edit' }}</span>
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar">
        <span :class="{ active: activeTab === 'proses' }" @click="activeTab = 'proses'">Proses</span>
        <span :class="{ active: activeTab === 'selesai' }" @click="goToCartDone">Selesai</span>
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
      <div v-else-if="!groupedItems.length" class="empty">
        Keranjang kosong
      </div>

      <!-- Cart Groups -->
      <template v-else>
        <div v-for="(items, sellerUsername) in groupedItems" :key="sellerUsername" class="cart-group">
          <div class="seller-info">
            <img
              class="seller-avatar"
              :src="items[0].seller?.avatarUrl || 'https://via.placeholder.com/40'"
              alt="avatar"
            />
            <span class="seller-name">{{ items[0].seller?.name || 'Seller' }}</span>
          </div>

          <div v-for="item in items" :key="item.id" class="product-card">
            <img
              class="product-img"
              :src="item.images?.[0] || 'https://via.placeholder.com/100'"
              alt="produk"
            />
            <div class="product-details">
              <p class="product-title">{{ item.name }}</p>
              <p class="product-price">Rp {{ item.price }}</p>
            </div>
            <button v-if="isEdit" class="delete-btn" @click="removeItem(item.id)">×</button>
          </div>

          <div class="actions">
            <button class="chat-btn" @click="openChat(items[0])">Chat penjual</button>
            <button class="selesai-btn" @click="completeOrder(items)">Selesai</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  addDoc,
  query,
  where,
  getDoc,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '@/firebase'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  images: string[]
  sellerId: string
  sellerUsername: string
  seller?: {
    name: string
    avatarUrl: string
  }
  createdAt: Date
}

export default defineComponent({
  name: 'CartPage',
  data() {
    return {
      activeTab: 'proses',
      isEdit: false,
      loading: true,
      error: null as string | null,
      cartItems: [] as CartItem[]
    }
  },
  computed: {
    groupedItems() {
      const grouped: { [key: string]: CartItem[] } = {}
      this.cartItems.forEach(item => {
        const sellerUsername = item.sellerUsername || 'unknown'
        if (!grouped[sellerUsername]) {
          grouped[sellerUsername] = []
        }
        grouped[sellerUsername].push(item)
      })
      return grouped
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    toggleEdit() {
      this.isEdit = !this.isEdit
    },
    async fetchCartItems() {
      try {
        this.loading = true
        this.error = null

        const auth = getAuth()
        const user = auth.currentUser

        if (!user) {
          this.cartItems = []
          return
        }

        const cartRef = collection(db, 'carts', user.uid, 'items')
        const cartSnapshot = await getDocs(cartRef)

        this.cartItems = cartSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CartItem))
      } catch (err) {
        this.error = 'Failed to load cart items'
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async removeItem(itemId: string) {
      try {
        const auth = getAuth()
        const user = auth.currentUser

        if (!user) return

        const cartItemRef = doc(db, 'carts', user.uid, 'items', itemId)
        await deleteDoc(cartItemRef)
        await this.fetchCartItems()
      } catch (err) {
        console.error('Failed to remove item:', err)
      }
    },
    async completeOrder(items: CartItem[]) {
      try {
        const auth = getAuth()
        const user = auth.currentUser

        if (!user) return

        const batch = writeBatch(db)
        const cartDoneRef = collection(db, 'users', user.uid, 'cart_done')

        for (const item of items) {
          // Add to cart_done
          const newDoneRef = doc(cartDoneRef)
          batch.set(newDoneRef, {
            ...item,
            completedAt: serverTimestamp()
          })

          // Remove from cart
          const cartItemRef = doc(db, 'carts', user.uid, 'items', item.id)
          batch.delete(cartItemRef)

          // Update seller's totalProductSold
          if (item.sellerId) {
            const sellerRef = doc(db, 'users', item.sellerId)
            batch.update(sellerRef, {
              totalProductSold: increment(1)
            })
          }
        }

        await batch.commit()
        // Navigate to CartDone page after successful completion
        this.$router.push({ name: 'CartDone' })
      } catch (err) {
        console.error('Failed to complete order:', err)
        this.error = 'Gagal menyelesaikan pesanan'
      }
    },
    openChat(item: CartItem) {
      this.$router.push({
        name: 'ChatDetail',
        params: {
          receiverId: item.sellerId
        },
        query: {
          name: item.seller?.name,
          avatarUrl: item.seller?.avatarUrl,
          productInfo: JSON.stringify({
            id: item.id,
            name: item.name,
            price: item.price,
            images: item.images,
            sellerName: item.seller?.name,
            sellerUsername: item.sellerUsername,
            sellerId: item.sellerId
          })
        }
      })
    },
    goToCartDone() {
      this.$router.push({ name: 'CartDone' })
    }
  },
  async created() {
    await this.fetchCartItems()
  }
})
</script>

<style scoped>
.cart-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 32px 0;
  font-family: sans-serif;
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
}

.edit-btn {
  color: #7c4dff;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  padding: 8px;
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

.cart-group {
  background: white;
  padding: 32px 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0;
}

.seller-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.seller-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
}

.seller-name {
  font-weight: 500;
  font-size: 18px;
}

.product-card {
  display: flex;
  position: relative;
  background: #f9f9f9;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.product-img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 20px;
}

.product-details {
  flex-grow: 1;
}

.product-title {
  margin: 0;
  font-weight: 600;
  font-size: 18px;
}

.product-price {
  margin: 8px 0 0 0;
  color: #444;
  font-size: 16px;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ffdddd;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions {
  display: flex;
  justify-content: flex-start;
  gap: 16px;
  margin-top: 20px;
}

.chat-btn {
  flex: 1;
  padding: 12px 24px;
  border: 1px solid #111;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.chat-btn:hover {
  background-color: #f5f5f5;
}

.selesai-btn {
  flex: 1;
  background: #111;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.selesai-btn:hover {
  background-color: #333;
}

.empty {
  text-align: center;
  color: #aaa;
  margin-top: 60px;
  font-size: 18px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #ff4444;
}
</style>
