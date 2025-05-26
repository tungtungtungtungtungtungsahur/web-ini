<template>
  <AppBar />
  <div class="tentang-toko-page">
    <div class="main-container">
      <section class="profile-section" v-if="!selectedProduct">
        <div class="profile-image">
          <img :src="profileImageUrl" alt="Profile Picture">
        </div>
        <div class="profile-info">
          <h2>{{ name }}</h2>
          <p>@{{ username }} <span class="verified-badge">Terverifikasi</span></p>
          <p>📍 {{ location }}</p>
        </div>
      </section>

      <div class="tab-box">
        <nav class="tabs" v-if="!selectedProduct">
          <button
            :class="{ 'tab-button': true, 'active': activeTab === 'Barang' }"
            @click="activeTab = 'Barang'"
          >
            Barang
          </button>
          <button
            :class="{ 'tab-button': true, 'active': activeTab === 'Tentang' }"
            @click="activeTab = 'Tentang'"
          >
            Tentang
          </button>
        </nav>

        <section class="barang-section" v-if="activeTab === 'Barang' && !selectedProduct">
          <div class="barang-list">
            <div class="barang-item" v-for="product in userProducts" :key="product.id">
              <img :src="product.images[0] || '/placeholder.png'" alt="Product Image" class="product-image">
              <div class="product-details">
                <div class="product-info">
                  <h3>{{ product.name }}</h3>
                  <p>Rp {{ product.price }}</p>
                </div>
                <div class="action-icons">
                  <span class="edit-icon" @click="viewProductDetail(product)">✏️</span>
                  <span class="delete-icon" @click="deleteProduct(product)">🗑️</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="tentang-section" v-if="activeTab === 'Tentang' && !selectedProduct">
          <div class="info-container" v-if="hasStoreData">
            <div class="info-item">
              <span class="icon">📄</span>
              <div class="text-content">
                <h3>Deskripsi</h3>
                <p>{{ storeDescription }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="icon">📍</span>
              <div class="text-content">
                <h3>Lokasi</h3>
                <p>{{ location }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="icon">👥</span>
              <div class="text-content">
                <h3>Kategori</h3>
                <p>{{ storeCategories }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="icon">📞</span>
              <div class="text-content">
                <h3>Kontak</h3>
                <p>{{ storeContact }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="icon">⏰</span>
              <div class="text-content">
                <h3>Jam Operasional</h3>
                <p>{{ storeOperatingHours }}</p>
              </div>
            </div>
          </div>
          <div class="info-container" v-else>
            <div class="no-data-content">
              <p>Tidak terdapat informasi terkait toko ini</p>
              <button class="fill-data-btn" @click="$router.push('/BioDataToko')">Isi Biodata Toko</button>
            </div>
          </div>
        </section>
      </div>

      <section class="product-detail-section" v-if="selectedProduct">
        <div class="product-images">
          <div v-for="(image, index) in selectedProduct.images" :key="index" class="product-image-item">
            <img
              :src="image || '/placeholder.png'"
              :alt="`${selectedProduct.name} - ${index + 1}`"
              @error="handleImageError"
              @click="openImageModal(image || '/placeholder.png')"
            >
          </div>
        </div>
        <div class="detail-content">
          <h2>{{ selectedProduct.name }}</h2>
          <p class="detail-price">Rp {{ selectedProduct.price }}</p>

          <div class="detail-section">
            <h3>Deskripsi</h3>
            <p>{{ selectedProduct.description }}</p>
          </div>

          <div class="detail-section">
            <h3>Detail Produk</h3>
            <p>Kategori: {{ selectedProduct.category }}</p>
            <p>Kondisi: {{ selectedProduct.condition }}</p>
            <p>Style: {{ selectedProduct.style }}</p>
          </div>
        </div>
      </section>

      <div class="modal-overlay" v-if="showDeleteModal"></div>
      <div class="modal-container" v-if="showDeleteModal">
        <div class="modal-content">
          <p>Apakah Anda yakin ingin menghapus produk ini?</p>
          <div class="modal-buttons">
            <button @click="confirmDelete">Ya</button>
            <button @click="cancelDelete">Tidak</button>
          </div>
        </div>
      </div>

      <div class="image-modal-overlay" v-if="showImageModal" @click="closeImageModal"></div>
      <div class="image-modal-container" v-if="showImageModal">
        <img :src="currentZoomImageUrl" alt="Zoomed Image" class="zoomed-image">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import AppBar from '../components/AppBar.vue'
import { auth, db } from '../firebase'
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export default {
  name: 'AkunTokoSisiPenjual',
  components: {
    AppBar
  },
  data() {
    return {
      profileImageUrl: '',
      name: '',
      username: '',
      location: '',
      activeTab: 'Tentang',
      storeDescription: '',
      storeLocation: '',
      storeCategories: '',
      storeContact: '',
      storeOperatingHours: '',
      hasStoreData: false,
      userProducts: [],
      selectedProduct: null,
      showDeleteModal: false,
      productToDelete: null,
      showImageModal: false,
      currentZoomImageUrl: '',
    };
  },
  created() {
    if (this.$route.query.tab === 'Barang') {
      this.activeTab = 'Barang';
    }

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          this.name = userData.name || '';
          this.username = userData.username || '';
          this.profileImageUrl = userData.profileImageUrl || 'https://via.placeholder.com/100';
        }

        const storeRef = doc(db, 'stores', user.uid);
        const storeSnap = await getDoc(storeRef);

        if (storeSnap.exists()) {
          const storeData = storeSnap.data();
          this.storeDescription = storeData.description || '';
          this.location = storeData.location || '-';
          this.storeCategories = storeData.categories || '';
          this.storeContact = storeData.contact || '';
          this.storeOperatingHours = storeData.operatingHours || '';
          this.hasStoreData = true;
        } else {
          this.hasStoreData = false;
          this.location = '-';
        }

        this.fetchUserProducts(user.uid);
      }
    });
  },
  methods: {
    async fetchUserProducts(userId) {
      try {
        const productsCollection = collection(db, 'products');
        const userProductsQuery = query(productsCollection, where('sellerId', '==', userId));
        const querySnapshot = await getDocs(userProductsQuery);

        this.userProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Fetched user products:', this.userProducts);
        // Log images array for each user product to debug
        this.userProducts.forEach(product => {
          console.log(`User Product ${product.id} images:`, product.images);
        });
      } catch (error) {
        console.error('Error fetching user products:', error);
      }
    },
    viewProductDetail(product) {
      console.log('Viewing product detail for:', product);
      this.selectedProduct = product;
      this.$router.push({ name: 'editDetailProduk', params: { productId: product.id } });
    },
    goBack() {
      this.$router.push('/akun');
    },
    editProduct() {
      this.$router.push({ name: 'editDetailProduk', params: { productId: this.selectedProduct.id } });
    },
    deleteProduct(product) {
      this.productToDelete = product;
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      try {
        if (this.productToDelete) {
          // Delete from Firestore
          const productRef = doc(db, 'products', this.productToDelete.id);
          await deleteDoc(productRef);
          
          // Update local state
          this.userProducts = this.userProducts.filter(product => product.id !== this.productToDelete.id);
          this.selectedProduct = null;
          this.showDeleteModal = false;
          this.productToDelete = null;
          
          alert('Produk berhasil dihapus!');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Gagal menghapus produk. Silakan coba lagi.');
      }
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.productToDelete = null;
    },
    handleImageError(event) {
      event.target.src = '/placeholder.png';
    },
    openImageModal(imageUrl) {
      this.currentZoomImageUrl = imageUrl;
      this.showImageModal = true;
    },
    closeImageModal() {
      this.showImageModal = false;
      this.currentZoomImageUrl = '';
    },
  }
}
</script>

<style scoped>
.tentang-toko-page {
  padding: 20px;
  background: #f9f9f9;
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.header {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background-color: #2c3e50;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  padding-left: 70px;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.back-button {
  margin-right: 50px;
  margin-left: -50px;
  background: none;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  padding: 0;
}

.header h1 {
  margin: 0;
  font-size: 1.8em;
  color: white;
  font-weight: normal;
}

.product-detail-title {
  flex-grow: 0;
  text-align: left;
}

.header-icons {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-left: auto;
}

.edit-icon-header, .delete-icon-header {
    font-size: 1.2em;
    color: white;
    cursor: pointer;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
  background-color: #f8f8f8;

}

#app {
  margin: 0;
  padding: 0;
}

.profile-section {
  display: flex;
  align-items: center;
  padding: 16px 24px 24px 24px;
  margin: 10px 0 20px 0;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.profile-image img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin-right: 20px;
  object-fit: cover;
  border: 1px solid #eee;
}

.profile-info {
    flex-grow: 1;
    color: #333;
}

.profile-info h2 {
  margin: 0 0 4px 0;
  font-size: 1.4em;
  color: #333;
}

.profile-info p {
  margin: 0 0 2px 0;
  color: #555;
  font-size: 0.95em;
}

.verified-badge {
  background-color: #007bff;
  color: white;
  padding: 2px 7px;
  border-radius: 12px;
  font-size: 0.75em;
  vertical-align: middle;
  margin-left: 6px;
  font-weight: normal;
}

.rating {
  margin-top: 6px;
  font-size: 0.9em;
  color: #ff9800;
}

.rating span {
  font-weight: bold;
  margin-right: 4px;
  color: #333;
}

.tabs {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 30px;
  border-bottom: 1px solid #ddd;
  padding: 0 20px;
  gap: 30px;
  background-color: #fff;
  border-radius: 8px;
  margin: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding-top: 12px;
   padding-bottom: 0;
}

.tab-box {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 32px;
  padding: 16px 24px 24px 24px;
}

.tab-button {
  padding: 12px 0;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.2em;
  position: relative;
  color: #777;
  transition: color 0.3s ease;
}

.tab-button:hover {
    color: #333;
}

.tab-button.active {
  color: #000;
  font-weight: bold;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #000;
}

.tentang-section, .barang-section {
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 16px 24px 24px 24px;
}

.info-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-top: 0;
  color: #333;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid #eee;
}

.info-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.info-item .icon {
  margin-right: 15px;
  font-size: 1.4em;
  color: #555;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.info-item .text-content {
  flex-grow: 1;
}

.info-item h3 {
  margin: 0 0 4px 0;
  font-size: 1em;
  font-weight: bold;
  color: #333;
}

.info-item p {
  margin: 0;
  color: #555;
  font-size: 0.95em;
  line-height: 1.5;
}

.barang-section {
  padding: 0 20px;
  margin-top: 20px;
}

.barang-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.barang-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  color: #333;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  flex-basis: calc(25% - 11.25px);
  justify-content: space-between;
  overflow: hidden;
}

.product-image {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 30px;
}

.product-details {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    flex-grow: 1;
}

.product-info {
    flex-grow: 1;
}

.product-info h3 {
    margin: 0 0 5px 0;
    font-size: 1em;
    font-weight: normal;
    color: #333;
}

.product-info p {
    margin: 0;
    font-size: 0.9em;
    color: #555;
}

.action-icons {
    display: flex;
    gap: 10px;
    align-items: center;
}

.edit-icon, .delete-icon {
    font-size: 1.2em;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.edit-icon {
    color: #007bff;
}

.delete-icon {
    color: #dc3545;
}

.edit-icon:hover, .delete-icon:hover {
    transform: scale(1.1);
}

.product-detail-section {
  padding-top: 20px;
  padding-bottom: 20px;
  background-color: #f8f8f8;
  overflow: hidden;
}

.product-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, 160px); /* Increase fixed size for grid items to 160px */
  gap: 20px; /* Adjust gap */
  margin-bottom: 50px; /* Add more space between images and text */
}

.product-image-item {
  width: 160px; /* Set fixed width for the container */
  height: 160px; /* Set fixed height for the container */
  border-radius: 6px; /* Keep border radius */
  overflow: hidden;
  /* Remove aspect-ratio as we are using fixed height and width */
}

.product-image-item img {
  width: 100%; /* Fill the container */
  height: 100%; /* Fill the container */
  object-fit: cover;
}

.detail-content {
  padding: 0 20px;
  color: #333;
}

.detail-content h2 {
  margin-top: 15px;
  margin-bottom: 5px;
  font-size: 1.6em;
}

.detail-price {
  margin: 0 0 15px 0;
  font-size: 1.2em;
  color: #ff9800;
  font-weight: bold;
}

.detail-section {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.detail-section h3 {
  margin: 0 0 8px 0;
  font-size: 1.1em;
  font-weight: bold;
}

.detail-section p {
  margin: 0 0 4px 0;
  font-size: 1em;
  color: #555;
  line-height: 1.5;
}

.detail-section p:last-child {
  margin-bottom: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 101;
  text-align: center;
}

.modal-content p {
  margin-bottom: 20px;
  color: #000;
}

.modal-buttons button {
  margin: 0 10px;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-buttons button:first-child {
  background-color: #dc3545;
  color: white;
}

.modal-buttons button:last-child {
  background-color: #6c757d;
  color: white;
}

.no-data-content {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  margin-top: 30px;
}

.no-data-content p {
  margin-bottom: 20px;
  font-size: 1.1em;
}

.fill-data-btn {
  background-color: #1a2b35;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.fill-data-btn:hover {
  background-color: #2c3e50;
}

@media (min-width: 768px) {
    .barang-item {
        flex-basis: calc(25% - 11.25px);
    }
}

.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 100;
}

.image-modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 101;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.zoomed-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>