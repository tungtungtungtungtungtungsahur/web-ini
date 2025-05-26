<template>
  <div class="home-page">
    <div class="categories-section">
      <h2>Kategori</h2>
      <div class="categories-scroll">
        <div
          v-for="category in categories"
          :key="category.label"
          :class="['category-item', { active: selectedCategory === category.label }]"
          @click="selectCategory(category.label)"
        >
          <i :class="category.icon"></i>
          <span>{{ category.label }}</span>
        </div>
      </div>
    </div>

    <div class="products-section">
      <h2>Rekomendasi Untuk Anda</h2>
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      <div v-else-if="!products.length" class="no-products">
        Produk tidak ditemukan
      </div>
      <div v-else class="products-grid">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
          @click="navigateToDetail(product)"
        >
          <div class="product-image">
            <img
              :src="product.images[0] || '/placeholder.png'"
              :alt="product.name"
              @error="handleImageError"
            >
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="price">Rp. {{ formatPrice(product.price) }}</p>
            <div class="condition">
              <i class="fas fa-star" :class="{ 'new': product.condition === 'new' }"></i>
              <span>{{ product.condition }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'

defineComponent({
  name: 'HomePage'
})

interface Category {
  icon: string
  label: string
}

interface Product {
  id: string
  name: string
  description: string
  price: string
  images: string[]
  category: string
  condition: string
  sellerId: string
  sellerUsername: string
}

const router = useRouter()

// State
const selectedCategory = ref<string>('Semua')
const loading = ref<boolean>(true)
const error = ref<string>('')
const products = ref<Product[]>([])

// Categories data
const categories = ref<Category[]>([
  { icon: 'fas fa-th-large', label: 'Semua' },
  { icon: 'fas fa-tshirt', label: 'Fashion' },
  { icon: 'fas fa-couch', label: 'Furniture' },
  { icon: 'fas fa-plug', label: 'Elektronik' },
  { icon: 'fas fa-gem', label: 'Aksesoris' },
  { icon: 'fas fa-running', label: 'Sepatu' },
  { icon: 'fas fa-shopping-bag', label: 'Tas' },
  { icon: 'fas fa-paint-brush', label: 'Kosmetik' },
  { icon: 'fas fa-home', label: 'Perabotan' }
])

// Fetch products from Firestore
const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = ''

    const productsRef = collection(db, 'products')
    const q = query(productsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    const fetchedProducts: Product[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      fetchedProducts.push({
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        price: data.price?.toString() || '0',
        images: data.images || [],
        category: data.category || 'Lainnya',
        condition: data.condition || 'new',
        sellerId: data.sellerId || '',
        sellerUsername: data.sellerUsername || 'anonymous'
      })
    })

    products.value = fetchedProducts
    console.log('Products fetched:', fetchedProducts)
    // Log images array for each product to debug
    fetchedProducts.forEach(product => {
      console.log(`Product ${product.id} images:`, product.images)
    })
  } catch (err) {
    console.error('Error fetching products:', err)
    error.value = 'Gagal memuat produk. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('Home component mounted')
  console.log('Current auth state:', auth.currentUser)
  fetchProducts()
})

// Computed
const filteredProducts = computed(() => {
  let filtered = products.value

  // Filter out products that belong to the current user
  if (auth.currentUser) {
    filtered = filtered.filter((p: Product) => p.sellerId !== auth.currentUser?.uid)
  }

  if (selectedCategory.value !== 'Semua') {
    filtered = filtered.filter((p: Product) => p.category === selectedCategory.value)
  }

  return filtered
})

// Methods
const selectCategory = (category: string): void => {
  selectedCategory.value = category
}

const navigateToDetail = (product: Product): void => {
  router.push({
    name: 'product-detail',
    params: { id: product.id }
  })
}

const handleImageError = (e: Event): void => {
  const target = e.target as HTMLImageElement
  target.src = '/placeholder.png'
}

const formatPrice = (price: string): string => {
  return price.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
</script>

<style scoped>
.home-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.categories-section {
  margin-bottom: 24px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.categories-section h2 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

.categories-scroll {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.categories-scroll::-webkit-scrollbar {
  display: none;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  min-width: 80px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.category-item.active {
  background-color: #f5f5f5;
  border-color: #000;
}

.category-item i {
  font-size: 24px;
  margin-bottom: 8px;
  color: #666;
}

.category-item span {
  font-size: 12px;
  text-align: center;
  color: #333;
}

.products-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.products-section h2 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 1px solid #eee;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.product-image {
  aspect-ratio: 1;
  overflow: hidden;
  background: #f8f9fa;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 12px;
}

.product-info h3 {
  font-size: 14px;
  margin: 0 0 8px;
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  display: -moz-box;
  display: box;
  -webkit-line-clamp: 2;
  -moz-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  -moz-box-orient: vertical;
  box-orient: vertical;
  text-overflow: ellipsis;
  word-break: break-word;
  color: #333;
}

.price {
  color: #e53935;
  font-weight: bold;
  margin: 0 0 8px;
}

.condition {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.condition i.new {
  color: #ffd700;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
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

.error, .no-products {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
