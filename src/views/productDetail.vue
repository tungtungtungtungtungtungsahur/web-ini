<template>
    <div class="product-detail">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      <div v-else-if="!product" class="not-found">
        Produk tidak ditemukan
      </div>
      <div v-else class="product-container">
        <!-- Header -->
        <div class="header">
          <button class="back-btn" @click="goBack">←</button>
          <h2>Detail Produk</h2>
        </div>

        <!-- Product Images -->
        <div class="product-images">
          <div v-for="(image, index) in product.images" :key="index" class="product-image-item">
            <img
              :src="image || '/placeholder.png'"
              :alt="`${product.name} - ${index + 1}`"
              @error="handleImageError"
            >
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <h1 class="product-title">{{ product.name }}</h1>
          <p class="product-price">Rp {{ formatPrice(product.price) }}</p>

          <!-- Seller Info -->
          <div class="seller-info" v-if="sellerData">
            <img
              :src="sellerData.avatarUrl || '/default-avatar.png'"
              :alt="sellerData.name"
              class="seller-avatar"
              @error="handleImageError"
            >
            <div class="seller-details">
              <h3 class="seller-name">{{ sellerData.name }}</h3>
              <p class="seller-username">@{{ sellerData.username }}</p>
            </div>
            <button class="visit-shop-btn" @click="visitShop">Kunjungi Toko</button>
          </div>

          <!-- Description -->
          <div class="description">
            <h3>Deskripsi</h3>
            <p>{{ product.description || 'Tidak ada deskripsi' }}</p>
          </div>

          <!-- Product Details -->
          <div class="product-details">
            <h3>Detail Produk</h3>
            <div class="detail-item">
              <span class="label">Kategori</span>
              <span class="value">{{ product.category || 'Tidak ada kategori' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Kondisi</span>
              <span class="value">{{ product.condition || 'Tidak ada informasi' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Style</span>
              <span class="value">{{ product.style || 'Tidak ada style' }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions">
            <button class="chat-btn" @click="startChat">Chat Penjual</button>
            <button class="cart-btn" @click="addToCart">+ Keranjang</button>
          </div>
        </div>

        <!-- Image Modal -->
        <div v-if="showModal" class="modal" @click="closeModal">
          <div class="modal-content" @click.stop>
            <button class="close-btn" @click="closeModal">×</button>
            <img
              :src="product.images[currentImageIndex]"
              :alt="product.name"
              @error="handleImageError"
            >
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { doc, getDoc } from 'firebase/firestore'
  import { db } from '../firebase'
  import { useCartStore } from '../stores/cart'

  interface Product {
    id: string
    name: string
    price: number
    description?: string
    images: string[]
    sellerId: string
    category?: string
    condition?: string
    style?: string
    sellerUsername?: string
  }

  interface Seller {
    id: string
    name: string
    username: string
    avatarUrl?: string
  }

  interface CartItem {
    id: string
    name: string
    price: number
    images: string[]
    sellerId: string
    sellerUsername?: string
    seller?: {
      name: string
      avatarUrl?: string
    }
  }

  const route = useRoute()
  const router = useRouter()
  const cartStore = useCartStore()

  const product = ref<Product | null>(null)
  const sellerData = ref<Seller | null>(null)
  const loading = ref(true)
  const error = ref('')
  const currentImageIndex = ref(0)
  const showModal = ref(false)

  onMounted(async () => {
    try {
      const productId = route.params.id as string
      const productDoc = await getDoc(doc(db, 'products', productId))

      if (productDoc.exists()) {
        product.value = { id: productDoc.id, ...productDoc.data() } as Product

        // Fetch seller data
        if (product.value.sellerId) {
          const sellerDoc = await getDoc(doc(db, 'users', product.value.sellerId))
          if (sellerDoc.exists()) {
            sellerData.value = { id: sellerDoc.id, ...sellerDoc.data() } as Seller
          }
        }
      }
    } catch (err) {
      console.error('Error fetching product:', err)
      error.value = 'Terjadi kesalahan saat memuat produk'
    } finally {
      loading.value = false
    }
  })

  const goBack = () => {
    router.go(-1)
  }

  const handleImageError = (e: Event) => {
    const target = e.target as HTMLImageElement
    target.src = '/placeholder.png'
  }

  const showImageModal = () => {
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
  }

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const visitShop = () => {
    if (sellerData.value) {
      router.push(`/shop/${sellerData.value.id}`)
    }
  }

  const startChat = () => {
    if (sellerData.value && product.value) {
      router.push({
        name: 'ChatDetail',
        params: {
          receiverId: sellerData.value.id,
          productId: product.value.id
        }
      })
    }
  }

  const addToCart = async () => {
    if (!product.value || !sellerData.value) return

    try {
      const cartItem: CartItem = {
        id: product.value.id,
        name: product.value.name,
        price: product.value.price,
        images: product.value.images,
        sellerId: product.value.sellerId,
        sellerUsername: sellerData.value.username,
        seller: {
          name: sellerData.value.name,
          avatarUrl: sellerData.value.avatarUrl
        }
      }
      await cartStore.addToCart(cartItem)
    } catch (err) {
      console.error('Error adding to cart:', err)
    }
  }
  </script>

  <style scoped>
  .product-detail {
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 16px;
  }

  .loading,
  .error,
  .not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    color: #666;
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

  .product-container {
    max-width: 600px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
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
    font-size: 18px;
    font-weight: bold;
  }

  .product-images {
    background: white;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .product-image-item {
    width: 100%;
    border-radius: 6px;
    overflow: hidden;
  }

  .product-image-item img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }

  .product-info {
    background: white;
    border-radius: 8px;
    padding: 16px;
  }

  .product-title {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }

  .product-price {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: bold;
    color: #ff6b00;
  }

  .seller-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    margin-bottom: 16px;
  }

  .seller-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .seller-details {
    flex: 1;
  }

  .seller-name {
    margin: 0 0 2px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .seller-username {
    margin: 0;
    font-size: 12px;
    color: #666;
  }

  .visit-shop-btn {
    background: none;
    border: 1px solid #007bff;
    color: #007bff;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .visit-shop-btn:hover {
    background: #007bff;
    color: white;
  }

  .description {
    margin-bottom: 16px;
  }

  .description h3 {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .description p {
    margin: 0;
    font-size: 14px;
    color: #666;
    line-height: 1.5;
  }

  .product-details {
    margin-bottom: 16px;
    padding-top: 16px;
    border-top: 1px solid #eee;
  }

  .product-details h3 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .detail-item {
    display: flex;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .detail-item:last-child {
    margin-bottom: 0;
  }

  .detail-item .label {
    width: 80px;
    color: #666;
    flex-shrink: 0;
  }

  .detail-item .value {
    color: #333;
    flex: 1;
  }

  .actions {
    display: flex;
    gap: 12px;
  }

  .chat-btn,
  .cart-btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .chat-btn {
    background: #f8f9fa;
    color: #000;
  }

  .chat-btn:hover {
    background: #e9ecef;
  }

  .cart-btn {
    background: #000;
    color: white;
  }

  .cart-btn:hover {
    background: #333;
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90vh;
  }

  .modal-content img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
  }

  .close-btn {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 32px;
    cursor: pointer;
    padding: 8px;
  }

  /* Responsive styles */
  @media (max-width: 480px) {
    .product-detail {
      padding: 12px;
    }

    .product-images {
      padding: 8px;
    }

    .product-image-item {
      width: 100%;
    }

    .product-info {
      padding: 12px;
    }

    .product-title {
      font-size: 16px;
    }

    .product-price {
      font-size: 18px;
    }

    .seller-avatar {
      width: 32px;
      height: 32px;
    }

    .seller-name {
      font-size: 13px;
    }

    .seller-username {
      font-size: 11px;
    }

    .visit-shop-btn {
      padding: 4px 8px;
      font-size: 11px;
    }

    .description h3 {
      font-size: 13px;
    }

    .description p {
      font-size: 13px;
    }

    .chat-btn,
    .cart-btn {
      padding: 10px;
      font-size: 13px;
    }

    .product-details h3 {
      font-size: 13px;
    }

    .detail-item {
      font-size: 13px;
    }

    .detail-item .label {
      width: 70px;
    }
  }
  </style>
