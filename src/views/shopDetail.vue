<template>
  <div class="shop-detail">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="!seller" class="not-found">
      Toko tidak ditemukan
    </div>
    <div v-else class="shop-container">
      <!-- Shop Header -->
      <div class="shop-header">
        <div class="shop-info">
          <img
            :src="seller.avatarUrl || '/default-avatar.png'"
            :alt="seller.name"
            class="shop-avatar"
            @error="handleImageError"
          >
          <div class="shop-details">
            <h1 class="shop-name">{{ seller.name }}</h1>
            <p class="shop-username">@{{ seller.username }}</p>
            <button class="report-btn" @click="showReportModal = true">
              <i class="fas fa-flag"></i> Laporkan Penjual
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'products' }"
            @click="activeTab = 'products'"
          >
            Produk
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'about' }"
            @click="activeTab = 'about'"
          >
            Tentang Penjual
          </button>
        </div>

        <!-- Products Tab -->
        <div v-show="activeTab === 'products'" class="tab-content">
          <div class="products-section">
            <div v-if="products.length === 0" class="no-products">
              Belum ada produk
            </div>
            <div v-else class="products-grid">
              <div v-for="product in products" :key="product.id" class="product-card" @click="viewProduct(product.id)">
                <div class="product-image">
                  <img
                    :src="product.images?.[0] || '/placeholder.png'"
                    :alt="product.name"
                    @error="handleImageError"
                  >
                </div>
                <div class="product-info">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-price">Rp {{ formatPrice(product.price) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- About Tab -->
        <div v-show="activeTab === 'about'" class="tab-content">
          <div class="about-card">
            <div class="about-row">
              <div class="about-icon">📄</div>
              <div class="about-info">
                <div class="about-label">Deskripsi</div>
                <div class="about-value">{{ seller.description || 'Belum ada deskripsi toko' }}</div>
              </div>
            </div>
            <hr>
            <div class="about-row">
              <div class="about-icon">📍</div>
              <div class="about-info">
                <div class="about-label">Lokasi</div>
                <div class="about-value">{{ seller.location || 'Belum diisi' }}</div>
              </div>
            </div>
            <hr>
            <div class="about-row">
              <div class="about-icon">👥</div>
              <div class="about-info">
                <div class="about-label">Kategori</div>
                <div class="about-value" v-if="seller.categories && seller.categories.length">
                  <span class="category-tag" v-for="cat in seller.categories" :key="cat">{{ cat }}</span>
                </div>
                <div class="about-value" v-else>Belum diisi</div>
              </div>
            </div>
            <hr>
            <div class="about-row">
              <div class="about-icon">📞</div>
              <div class="about-info">
                <div class="about-label">Kontak</div>
                <div class="about-value">{{ seller.contact || 'Belum diisi' }}</div>
              </div>
            </div>
            <hr>
            <div class="about-row">
              <div class="about-icon">⏰</div>
              <div class="about-info">
                <div class="about-label">Jam Operasional</div>
                <div class="about-value">{{ seller.operatingHours || 'Belum diisi' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Modal -->
      <div v-if="showReportModal" class="modal" @click="showReportModal = false">
        <div class="modal-content" @click.stop>
          <button class="close-btn" @click="showReportModal = false">×</button>
          <h2>Laporkan Penjual</h2>
          <form @submit.prevent="submitReport" class="report-form">
            <div class="form-group">
              <label for="reportReason">Alasan Pelaporan</label>
              <select id="reportReason" v-model="reportData.reason" required>
                <option value="">Pilih alasan</option>
                <option value="scam">Penipuan</option>
                <option value="fake">Produk Palsu</option>
                <option value="inappropriate">Konten Tidak Pantas</option>
                <option value="harassment">Pelecehan</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div class="form-group">
              <label for="reportDescription">Deskripsi</label>
              <textarea
                id="reportDescription"
                v-model="reportData.description"
                placeholder="Jelaskan detail pelaporan Anda..."
                required
                rows="4"
              ></textarea>
            </div>
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'

interface Seller {
  id: string
  name: string
  username: string
  avatarUrl?: string
  createdAt?: Date
  isVerified?: boolean
  shopName?: string
  shopAddress?: string
  city?: string
  province?: string
  email?: string
  phone?: string
  whatsapp?: string
  // Biodata fields
  description?: string
  location?: string
  categories?: string[]
  contact?: string
  operatingHours?: string
}

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  sellerId: string
}

const route = useRoute()
const router = useRouter()

const seller = ref<Seller | null>(null)
const products = ref<Product[]>([])
const loading = ref(true)
const error = ref('')
const showReportModal = ref(false)
const isSubmitting = ref(false)
const reportData = ref({
  reason: '',
  description: ''
})
const activeTab = ref('products')

onMounted(async () => {
  try {
    const sellerId = route.params.id as string
    // Fetch seller data from users
    const sellerDoc = await getDoc(doc(db, 'users', sellerId))
    if (sellerDoc.exists()) {
      seller.value = { id: sellerDoc.id, ...sellerDoc.data() } as Seller
    }
    // Fetch biodata from stores
    const storeDoc = await getDoc(doc(db, 'stores', sellerId))
    if (storeDoc.exists() && seller.value) {
      const storeData = storeDoc.data()
      seller.value.description = storeData.description || ''
      seller.value.location = storeData.location || ''
      seller.value.categories = storeData.categories || []
      seller.value.contact = storeData.contact || ''
      seller.value.operatingHours = storeData.operatingHours || ''
    }
    // Fetch seller's products
    const productsQuery = query(
      collection(db, 'products'),
      where('sellerId', '==', sellerId)
    )
    const productsSnapshot = await getDocs(productsQuery)
    products.value = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[]
  } catch (err) {
    console.error('Error fetching shop data:', err)
    error.value = 'Terjadi kesalahan saat memuat data toko'
  } finally {
    loading.value = false
  }
})

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = '/placeholder.png'
}

const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const viewProduct = (productId: string) => {
  router.push(`/product/${productId}`)
}

const submitReport = async () => {
  if (!auth.currentUser || !seller.value) return

  try {
    isSubmitting.value = true
    await addDoc(collection(db, 'reports'), {
      sellerId: seller.value.id,
      reporterId: auth.currentUser.uid,
      reason: reportData.value.reason,
      description: reportData.value.description,
      status: 'pending',
      createdAt: serverTimestamp()
    })

    showReportModal.value = false
    reportData.value = { reason: '', description: '' }
    alert('Laporan berhasil dikirim. Tim kami akan segera menindaklanjuti.')
  } catch (err) {
    console.error('Error submitting report:', err)
    alert('Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.shop-detail {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 32px 24px;
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

.shop-container {
  max-width: 1280px;
  margin: 0 auto;
}

.shop-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.shop-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.shop-details {
  flex: 1;
}

.shop-name {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.shop-username {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.tabs-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-bottom: 24px;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #eee;
  padding: 0 24px;
}

.tab-btn {
  padding: 16px 24px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn:hover {
  color: #333;
}

.tab-btn.active {
  color: #000;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #000;
}

.tab-content {
  /* Remove max-width, margin, and padding here */
}

.products-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
}

.section-title {
  margin: 0 0 24px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.no-products {
  text-align: center;
  padding: 48px 0;
  color: #666;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid #eee;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  aspect-ratio: 1/1;
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

.product-name {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #e53935;
}

.category-tag {
  background-color: #ddd;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  color: #555;
  margin-right: 6px;
  display: inline-block;
}

.about-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  /* No max-width or margin here */
}

.about-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
}

.about-icon {
  color: #d63384;
  font-size: 28px;
  width: 36px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.about-info {
  flex: 1;
}

.about-label {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}

.about-value {
  font-size: 15px;
  color: #333;
}

hr {
  border: none;
  border-top: 1px solid #f0f0f0;
  margin: 0;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  background: #f1f1f1;
  color: #666;
}

.status-badge.verified {
  background: #e8f5e9;
  color: #2e7d32;
}

.report-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-btn:hover {
  background: #dc3545;
  color: white;
}

.modal {
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  position: relative;
}

.modal-content h2 {
  margin: 0 0 24px;
  font-size: 20px;
  color: #333;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.form-group select,
.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  padding: 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #c82333;
}

.submit-btn:disabled {
  background: #dc354580;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .shop-detail {
    padding: 16px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .shop-avatar {
    width: 60px;
    height: 60px;
  }

  .shop-name {
    font-size: 20px;
  }

  .shop-username {
    font-size: 14px;
  }

  .modal-content {
    width: 95%;
    padding: 20px;
  }

  .tabs-header {
    padding: 0 16px;
  }

  .tab-btn {
    padding: 12px 16px;
    font-size: 14px;
  }

  .tab-content {
    /* Remove max-width and padding here */
  }

  .products-section, .about-card {
    padding: 12px;
  }

  .about-icon {
    font-size: 22px;
    width: 28px;
  }

  .about-label {
    font-size: 15px;
  }

  .about-value {
    font-size: 14px;
  }
}
</style>
