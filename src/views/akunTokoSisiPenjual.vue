<template>
  <div class="tentang-toko-page">
    <header class="header">
      <div class="header-content">
        <button class="back-button" @click="goBack">←</button>
        <h1 :class="{'product-detail-title': selectedProduct}">{{ selectedProduct ? selectedProduct.name : 'Akun Saya' }}</h1>
        <div class="header-icons" v-if="selectedProduct">
          <span class="edit-icon-header" @click="editProduct">✏️</span>
          <span class="delete-icon-header" @click="deleteProduct">🗑️</span>
        </div>
      </div>
    </header>

    <section class="profile-section" v-if="!selectedProduct">
      <div class="profile-image">
        <img :src="profileImageUrl" alt="Profile Picture">
      </div>
      <div class="profile-info">
        <h2>putri</h2>
        <p>@putriAja <span class="verified-badge">Terverifikasi</span></p>
        <p>📍 Bandung</p>
      </div>
    </section>

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
        <div class="barang-item" v-for="product in products" :key="product.id">
          <img :src="product.imageUrl" alt="Product Image" class="product-image">
          <div class="product-details">
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p>Rp {{ product.price }}</p>
            </div>
            <span class="edit-icon" @click="viewProductDetail(product)">✏️</span>
          </div>
        </div>
      </div>
    </section>

    <section class="tentang-section" v-if="activeTab === 'Tentang' && !selectedProduct">
      <div class="info-container">
        <div class="info-item">
          <span class="icon">📄</span>
          <div class="text-content">
            <h3>Deskripsi</h3>
            <p>Toko merupakan toko penjualan elektronik dan perabotan rumah terpecaya, bagi yang percaya aja😊</p>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">📍</span>
          <div class="text-content">
            <h3>Lokasi</h3>
            <p>Bandung Kota</p>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">👥</span>
          <div class="text-content">
            <h3>Kategori</h3>
            <p>Furniture, Elektronik</p>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">📞</span>
          <div class="text-content">
            <h3>Kontak</h3>
            <p>0812121212</p>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">⏰</span>
          <div class="text-content">
            <h3>Jam Operasional</h3>
            <p>Senin, 08:00-23:59</p>
          </div>
        </div>
      </div>
    </section>

    <section class="product-detail-section" v-if="selectedProduct">
      <img :src="selectedProduct.imageUrl" alt="Product Image" class="detail-product-image">
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

  </div>
</template>

<script>
export default {
  name: 'AkunTokoSisiPenjual',
  data() {
    return {
      profileImageUrl: '',
      activeTab: 'Tentang',
      products: [
        { id: 1, name: 'lampu', price: 1000, imageUrl: 'https://via.placeholder.com/300', description: 'hitam legam dan kalcwer', category: 'Elektronik', condition: 'Baru', style: 'Modern' },
        { id: 2, name: 'pintu lift', price: 125000000, imageUrl: 'https://via.placeholder.com/300', description: 'Deskripsi pintu lift', category: 'Furniture', condition: 'Baru', style: 'Minimalis' },
        { id: 3, name: 'Product 3', price: 50000, imageUrl: 'https://via.placeholder.com/300', description: 'Deskripsi Product 3', category: 'Aksesoris', condition: 'Bekas', style: 'Classic' },
        { id: 4, name: 'Product 4', price: 25000, imageUrl: 'https://via.placeholder.com/300', description: 'Deskripsi Product 4', category: 'Sepatu', condition: 'Baru', style: 'Sporty' },
      ],
      selectedProduct: null,
      showDeleteModal: false,
      productToDelete: null,
    };
  },
  created() {

  },
  methods: {
    viewProductDetail(product) {
      this.selectedProduct = product;
    },
    goBack() {
      // Use router to go back to the previous page
      // Example using Vue Router:
      this.$router.go(-1); // or this.$router.back();
      // If not using a router, you might need different logic
    },
    editProduct() {
      this.$router.push({ name: 'editDetailProduk', params: { productId: this.selectedProduct.id } });
    },
    deleteProduct() {
      this.productToDelete = this.selectedProduct; // Store product to delete
      this.showDeleteModal = true; // Show the custom modal
    },
    confirmDelete() {
      // Simulate loading if needed (e.g., this.isLoading = true)
      console.log('Deleting product:', this.productToDelete.id);

      // Simulate deletion by filtering the products array
      this.products = this.products.filter(product => product.id !== this.productToDelete.id);

      // Simulate successful deletion and return to list
      // this.isLoading = false;
      this.selectedProduct = null; // Return to the main list view
      this.showDeleteModal = false; // Hide the modal
      this.productToDelete = null; // Clear product to delete
      alert('Product deleted!');
    },
    cancelDelete() {
      this.showDeleteModal = false; // Hide the modal
      this.productToDelete = null; // Clear product to delete
    }
  }
}
</script>

<style scoped>
.tentang-toko-page {
  padding-top: 100px;
  padding-bottom: 20px;
  background-color: #f8f8f8;
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
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
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.back-button {
  margin-right: 15px;
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

  padding: 0;
  margin: 10px 20px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  padding: 20px;
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
  justify-content: center;
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

.tentang-section {
  padding: 0 20px;
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
    margin-bottom: 10px;
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

.edit-icon {
    align-self: flex-end;
    font-size: 1.2em;
    color: #777;
    cursor: pointer;
    margin-top: 10px;
}

.product-detail-section {
  padding-top: 20px;
  padding-bottom: 20px;
  background-color: #f8f8f8;
}

.detail-product-image {
  width: 100%;
  height: 300px;
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

@media (min-width: 768px) {
    .barang-item {
        flex-basis: calc(25% - 11.25px);
    }
}
</style>