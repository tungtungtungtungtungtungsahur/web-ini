<template>
  <div class="sell-container">
    <!-- Header -->
    <div class="header">
      <span class="close-btn">×</span>
      <h2>Jual produk</h2>
    </div>

    <!-- Upload Foto -->
    <div class="photo-upload">
      <div class="photo-preview">
        <img v-if="photo" :src="photo" alt="Preview" />
        <div v-else class="add-photo" @click="uploadPhoto">
          <span>Tambah foto</span>
        </div>
      </div>
      <p class="photo-info">Pilih hingga 4 foto</p>
    </div>

    <!-- Nama Produk -->
    <div class="form-group">
      <label>Nama Produk</label>
      <input v-model="productName" type="text" placeholder="Nama produk" />
    </div>

    <!-- Deskripsi -->
    <div class="form-group">
      <label>Deskripsi</label>
      <textarea v-model="description" placeholder="Deskripsi produk"></textarea>
      <div class="desc-info">
        <span>Hashtag: {{ hashtagCount }}</span>
        <span>{{ description.length }}/500</span>
      </div>
    </div>

    <!-- Kategori, Style, Kondisi, Harga -->
    <div class="form-group selector" @click="selectCategory">
      <label>Category</label>
      <span>{{ category }}</span>
    </div>
    <div class="form-group selector" @click="selectStyle">
      <label>Styles</label>
      <span>{{ style }}</span>
    </div>
    <div class="form-group selector" @click="selectCondition">
      <label>Condition</label>
      <span>{{ condition }}</span>
    </div>
    <div class="form-group">
      <label>Price</label>
      <input v-model="price" type="number" placeholder="Rp" />
    </div>

    <!-- Submit Button -->
    <button class="submit-btn" @click="submitForm" :disabled="isLoading">
      <span v-if="isLoading" class="spinner"></span>
      <span v-else>Submit</span>
    </button>

    <!-- Modal Sukses -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal-success">
        <h2>Sukses</h2>
        <p>Produk berhasil ditambahkan ke katalog</p>
        <button class="modal-ok" @click="showSuccessModal = false">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      photo: null,
      productName: '',
      description: '',
      category: 'Tas',
      style: 'Minimalis',
      condition: 'Bekas seperti baru',
      price: 250000,
      showSuccessModal: false,
      isLoading: false,
    };
  },
  computed: {
    hashtagCount() {
      return (this.description.match(/#/g) || []).length;
    },
  },
  methods: {
    uploadPhoto() {
      // Implementasi upload foto
    },
    selectCategory() {
      // Implementasi pilih kategori
    },
    selectStyle() {
      // Implementasi pilih style
    },
    selectCondition() {
      // Implementasi pilih kondisi
    },
    submitForm() {
      this.isLoading = true;
      // Simulasi proses submit (ganti dengan request asli jika ada)
      setTimeout(() => {
        this.isLoading = false;
        this.showSuccessModal = true;
        // Reset form jika perlu
      }, 1500);
    },
  },
};
</script>

<style scoped>
.sell-container {
  max-width: 400px;
  margin: 0 auto;
  background: #fafafa;
  padding: 16px;
  border-radius: 12px;
}
.header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.close-btn {
  font-size: 24px;
  cursor: pointer;
}
.photo-upload {
  margin: 16px 0;
}
.photo-preview {
  width: 100px;
  height: 100px;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
.add-photo {
  color: #888;
  cursor: pointer;
}
.photo-info {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
}
.form-group.selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.desc-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
}
.submit-btn {
  width: 100%;
  background: #111;
  color: #fff;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-success {
  background: #f6f2fa;
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  min-width: 260px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
}
.modal-success h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 500;
}
.modal-success p {
  margin: 0 0 20px 0;
  color: #444;
}
.modal-ok {
  background: none;
  border: none;
  color: #7c4dff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #b39ddb;
  border-top: 3px solid #7c4dff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
  margin-right: 8px;
}
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}
</style>