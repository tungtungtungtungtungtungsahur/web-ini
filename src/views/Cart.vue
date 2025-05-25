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
        <span
          :class="{ active: activeTab === 'proses' }"
          @click="activeTab = 'proses'"
        >
          Proses
        </span>
        <span
          :class="{ active: activeTab === 'selesai' }"
          @click="activeTab = 'selesai'"
        >
          Selesai
        </span>
      </div>

      <!-- Cart Items -->
      <div v-if="activeTab === 'proses'">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>
        <div v-else-if="error" class="error">
          {{ error }}
        </div>
        <div v-else-if="!cart.cartItems.length" class="empty">
          Belum ada item di keranjang.
        </div>
        <template v-else>
          <div v-for="item in cart.cartItems" :key="item.id" class="cart-group">
            <div class="product-card">
              <img
                :src="item.image"
                :alt="item.name"
                class="product-img"
                @error="handleImageError"
              >
              <div class="product-details">
                <p class="product-title">{{ item.name }}</p>
                <p class="product-price">Rp {{ formatPrice(item.price) }}</p>
                <div class="quantity-control">
                  <button @click="updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">-</button>
                  <span>{{ item.quantity }}</span>
                  <button @click="updateQuantity(item.id, item.quantity + 1)">+</button>
                </div>
              </div>
              <button v-if="isEdit" class="delete-btn" @click="removeItem(item.id)">×</button>
            </div>

            <div class="actions">
              <button class="chat-btn" @click="startChat(item)">Chat penjual</button>
              <button class="checkout-btn" @click="checkout(item)">Checkout</button>
            </div>
          </div>
        </template>
      </div>

      <!-- Cart Done -->
      <CartDone v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import CartDone from './CartDone.vue'
import { auth, db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import type { CartItem } from '../stores/cart'

defineOptions({
  name: 'CartPage'
})

const router = useRouter()
const cart = useCartStore()

const activeTab = ref('proses')
const isEdit = ref(false)
const loading = ref(true)
const error = ref('')

const cartItems = computed(() => cart.cartItems)

onMounted(() => {
  cart.fetchCartItems()
  loading.value = false

  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })
})

const goBack = () => {
  router.go(-1)
}

const toggleEdit = () => {
  isEdit.value = !isEdit.value
}

const removeItem = async (itemId: string) => {
  try {
    await cart.removeFromCart(itemId)
  } catch (err) {
    console.error('Error removing item:', err)
  }
}

const updateQuantity = async (itemId: string, quantity: number) => {
  if (quantity < 1) return
  await cart.updateQuantity(itemId, quantity)
}

const startChat = (item: CartItem) => {
  router.push({
    name: 'chat',
    params: {
      receiverId: item.sellerId
    },
    state: {
      productInfo: {
        name: item.name,
        price: item.price,
        image: item.image
      }
    }
  })
}

const checkout = (item: CartItem) => {
  router.push({
    name: 'checkout',
    params: {
      itemId: item.id
    }
  })
}

const checkoutAll = () => {
  router.push({
    name: 'checkout',
    params: {
      type: 'all'
    }
  })
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = '/placeholder.png'
}

const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
</script>

<style scoped>
.cart-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 32px 0;
  font-family: sans-serif;
}

.cart-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.edit-btn {
  color: #007bff;
  cursor: pointer;
}

.tab-bar {
  display: flex;
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.tab-bar span {
  flex: 1;
  text-align: center;
  padding: 12px;
  cursor: pointer;
  color: #666;
}

.tab-bar span.active {
  color: #000;
  font-weight: bold;
  border-bottom: 2px solid #000;
}

.cart-group {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.product-card {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
}

.product-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.product-details {
  flex: 1;
}

.product-title {
  margin: 0 0 8px;
  font-size: 16px;
}

.product-price {
  margin: 0;
  color: #ff6b00;
  font-weight: bold;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.quantity-control button {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-control span {
  min-width: 24px;
  text-align: center;
}

.delete-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  font-size: 24px;
  color: #dc3545;
  cursor: pointer;
  padding: 4px;
}

.actions {
  display: flex;
  gap: 12px;
}

.chat-btn,
.checkout-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.chat-btn {
  background: #f8f9fa;
  color: #000;
}

.checkout-btn {
  background: #000;
  color: white;
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

.error,
.empty {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
