<template>
  <div class="search-results-page">
    <div class="search-container">
      <div class="header">
        <button class="back-btn" @click="goBack">←</button>
        <h2>Hasil Pencarian: '{{ keyword }}'</h2>
      </div>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="products.length === 0" class="empty">Tidak ada produk ditemukan.</div>
      <div v-else class="products-list">
        <div v-for="product in products" :key="product.id" class="product-card">
          <img :src="product.images?.[0] || 'https://via.placeholder.com/120'" class="product-img" alt="product" />
          <div class="product-details">
            <p class="product-title">{{ product.name }}</p>
            <p class="product-price">Rp. {{ product.price }}</p>
            <p class="product-meta">
              <span>{{ product.condition || 'Bekas' }}</span>
              <span>•</span>
              <span>@{{ product.sellerUsername || 'anonymous' }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  condition?: string
  sellerUsername?: string
}

export default defineComponent({
  name: 'SearchResults',
  data() {
    return {
      loading: true,
      error: null as string | null,
      products: [] as Product[],
      keyword: ''
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    async fetchProducts() {
      try {
        this.loading = true
        this.error = null
        const route = useRoute()
        this.keyword = (route.query.keyword as string || '').trim()
        if (!this.keyword) {
          this.products = []
          return
        }
        // Fetch all products (or optimize with Firestore query if indexed)
        const productsRef = collection(db, 'products')
        const snapshot = await getDocs(productsRef)
        const keywordLower = this.keyword.toLowerCase()
        this.products = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((p: any) =>
            (p.name || '').toLowerCase().includes(keywordLower)
          )
      } catch (err) {
        this.error = 'Gagal memuat produk.'
        console.error(err)
      } finally {
        this.loading = false
      }
    }
  },
  async created() {
    await this.fetchProducts()
  },
  watch: {
    // Refetch if the route changes (new keyword)
    '$route.query.keyword': {
      immediate: false,
      handler() {
        this.fetchProducts()
      }
    }
  }
})
</script>

<style scoped>
.search-results-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 32px 0;
  font-family: sans-serif;
}
.search-container {
  max-width: 1000px;
  margin: 32px auto;
  padding: 0 24px 32px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 24px 0 0 0;
}
.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
}
h2 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}
.loading, .error, .empty {
  text-align: center;
  padding: 40px;
  color: #aaa;
  font-size: 18px;
}
.products-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
.product-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  width: 220px;
  padding: 0 0 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.product-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
}
.product-details {
  width: 100%;
  padding: 12px 16px 0 16px;
}
.product-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}
.product-price {
  margin: 0 0 4px 0;
  color: #ff6600;
  font-size: 15px;
  font-weight: bold;
}
.product-meta {
  margin: 0;
  color: #888;
  font-size: 13px;
  display: flex;
  gap: 6px;
  align-items: center;
}
</style>
