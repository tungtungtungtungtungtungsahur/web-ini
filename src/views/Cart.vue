<template>
  <div class="cart-page">
    <div class="cart-container">
      <!-- Header -->
      <div class="header">
        <h2>Keranjang</h2>
        <span class="edit-btn" @click="toggleEdit">{{ isEdit ? 'Selesai' : 'Edit' }}</span>
      </div>

      <!-- Tab Bar -->
      <div class="tab-bar">
        <span :class="{ active: activeTab === 'proses' }" @click="activeTab = 'proses'">Proses</span>
        <span :class="{ active: activeTab === 'selesai' }" @click="goToCartDone">Selesai</span>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-if="Object.keys(groupedItems).length === 0" class="empty">
        Keranjang kosong
      </div>

      <!-- Cart Groups -->
      <div v-else>
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
              <div class="hapus-btn-wrapper" v-if="isEdit">
                <button
                  class="hapus-btn"
                  @click="removeItem(item.id)"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>

          <div class="actions">
            <button class="chat-btn" @click="openChat(items[0])">Chat penjual</button>
            <button class="selesai-btn" @click="completeOrder(items)">Selesai</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  increment,
  onSnapshot
} from 'firebase/firestore'
import { db, auth } from '@/firebase'

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
  setup() {
    const router = useRouter()
    const activeTab = ref('proses')
    const isEdit = ref(false)
    const loading = ref(true)
    const error = ref<string | null>(null)
    const cartItems = ref<CartItem[]>([])

    onMounted(() => {
      const user = auth.currentUser
      if (!user) return
      const cartRef = collection(db, 'carts', user.uid, 'items')
      onSnapshot(cartRef, (snapshot) => {
        cartItems.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CartItem))
      })
    })

    const groupedItems = computed(() => {
      const grouped: { [key: string]: CartItem[] } = {}
      cartItems.value.forEach(item => {
        const sellerUsername = item.sellerUsername || 'unknown'
        if (!grouped[sellerUsername]) {
          grouped[sellerUsername] = []
        }
        grouped[sellerUsername].push(item)
      })
      return grouped
    })

    const removeItem = async (itemId: string) => {
      try {
        const user = auth.currentUser
        if (!user) return

        const cartItemRef = doc(db, 'carts', user.uid, 'items', itemId)
        await deleteDoc(cartItemRef)
        await fetchCartItems()
      } catch (err) {
        console.error('Failed to remove item:', err)
      }
    }

    const completeOrder = async (items: CartItem[]) => {
      try {
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
        router.push({ name: 'CartDone' })
      } catch (err) {
        console.error('Failed to complete order:', err)
        error.value = 'Gagal menyelesaikan pesanan'
      }
    }

    const openChat = (item: CartItem) => {
      router.push({
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
    }

    const goToCartDone = () => {
      router.push({ name: 'CartDone' })
    }

    const fetchCartItems = async () => {
      try {
        loading.value = true
        error.value = null

        const user = auth.currentUser

        if (!user) {
          cartItems.value = []
          return
        }

        const cartRef = collection(db, 'carts', user.uid, 'items')
        const cartSnapshot = await getDocs(cartRef)

        cartItems.value = cartSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CartItem))
      } catch (err) {
        error.value = 'Failed to load cart items'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const toggleEdit = () => {
      isEdit.value = !isEdit.value
    }

    const removeFromCart = async (itemId: string) => {
      const user = auth.currentUser
      if (!user) return
      await deleteDoc(doc(db, 'carts', user.uid, 'items', itemId))
    }

    const goBack = () => {
      router.go(-1)
    }

    return {
      activeTab,
      isEdit,
      loading,
      error,
      cartItems,
      groupedItems,
      removeItem,
      completeOrder,
      openChat,
      goToCartDone,
      fetchCartItems,
      toggleEdit,
      removeFromCart,
      goBack
    }
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
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 48px 48px 48px;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 32px 0 0 0;
}

h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  flex: 1;
  text-align: center;
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

.hapus-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.hapus-btn {
  background: #ff4444;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  width: auto;
  min-width: 80px;
}

.hapus-btn:hover {
  background: #d32f2f;
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

.error {
  color: #ff4444;
}
</style>
