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
        <span :class="{ active: activeTab === 'proses' }" @click="activeTab = 'proses'"
          >Proses</span
        >
        <span :class="{ active: activeTab === 'selesai' }" @click="activeTab = 'selesai'"
          >Selesai</span
        >
      </div>

      <!-- Cart Group -->
      <div class="cart-group" v-if="activeTab === 'proses'">
        <div class="seller-info">
          <img class="seller-avatar" src="https://via.placeholder.com/40" alt="avatar" />
          <span class="seller-name">jedac jedug</span>
        </div>

        <div class="product-card">
          <img class="product-img" src="https://via.placeholder.com/100" alt="produk" />
          <div class="product-details">
            <p class="product-title">buku</p>
            <p class="product-price">Rp 999666</p>
          </div>
          <button v-if="isEdit" class="delete-btn">×</button>
        </div>

        <div class="actions">
          <button class="chat-btn">Chat penjual</button>
          <button class="selesai-btn">Selesai</button>
        </div>
      </div>

      <!-- Belum ada data -->
      <div v-else class="empty">Belum ada item selesai.</div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'CartPage',
  data() {
    return {
      activeTab: 'proses',
      isEdit: false,
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    toggleEdit() {
      this.isEdit = !this.isEdit
    },
  },
}
</script>

<style scoped>
.cart-page {
  background-color: #fff0fa;
  min-height: 100vh;
  padding: 32px 0;
  font-family: sans-serif;
}

.cart-container {
  max-width: 1000px;
  margin: 0 auto;
  background: none;
  padding: 0 24px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 0;
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
  border-bottom: 2px solid #ccc;
  padding: 0;
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
</style>
