<template>
  <div class="sell-container">
    <div class="form-wrapper">
      <!-- Header -->
      <div class="header">
        <span class="close-btn" @click="closeForm">×</span>
        <h2>Jual produk</h2>
      </div>

      <!-- Upload Foto -->
      <div class="photo-upload">
        <div class="photo-list">
          <!-- Tombol tambah foto -->
          <div class="photo-preview add-photo" v-if="photos.length < 4" @click="triggerFileInput">
            <span>Tambah foto</span>
          </div>
          <!-- Foto yang sudah diupload -->
          <div class="photo-preview uploaded-photo" v-for="(url, idx) in photos" :key="url">
            <img :src="url" alt="Preview" />
            <button class="remove-photo" @click="removePhoto(idx)">×</button>
          </div>
        </div>
        <p class="photo-info">Pilih hingga 4 foto</p>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="onPhotoChange"
          multiple
          style="display: none"
        />
      </div>

      <!-- Nama Produk -->
      <div class="form-group">
        <label>Nama Produk</label>
        <input v-model="productName" type="text" placeholder="Nama produk" />
      </div>

      <!-- Deskripsi -->
      <div class="form-group">
        <label>Deskripsi</label>
        <textarea
          v-model="description"
          @input="onDescriptionInput"
          placeholder="Deskripsi produk"
        ></textarea>
        <div class="desc-info">
          <span>Hashtag: {{ hashtagCount }}</span>
          <span>{{ descriptionWordCount }}/500 kata</span>
        </div>
      </div>

      <!-- Kategori, Style, Kondisi, Harga -->
      <div class="form-group selector" @click="showCategoryModal = true">
        <label>Kategori</label>
        <span>{{ category }}</span>
      </div>
      <div class="form-group selector" @click="showStyleModal = true">
        <label>Style</label>
        <span>{{ style }}</span>
      </div>
      <div class="form-group selector" @click="showConditionModal = true">
        <label>Kondisi</label>
        <span>{{ condition }}</span>
      </div>
      <div class="form-group selector" @click="openPriceModal">
        <label>Harga</label>
        <span>{{
          price !== null && price !== 'Masukkan harga' ? 'Rp ' + price : 'Masukkan harga'
        }}</span>
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

      <!-- Modal Pilih Kategori -->
      <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
        <div class="modal-select">
          <h3>Pilih Kategori</h3>
          <ul>
            <li v-for="cat in categories" :key="cat" @click="selectCategory(cat)">{{ cat }}</li>
          </ul>
          <button class="modal-ok" @click="showCategoryModal = false">Tutup</button>
        </div>
      </div>

      <!-- Modal Pilih Style -->
      <div v-if="showStyleModal" class="modal-overlay" @click.self="showStyleModal = false">
        <div class="modal-select">
          <h3>Pilih Style</h3>
          <ul>
            <li v-for="sty in styles" :key="sty" @click="selectStyle(sty)">{{ sty }}</li>
          </ul>
          <button class="modal-ok" @click="showStyleModal = false">Tutup</button>
        </div>
      </div>

      <!-- Modal Pilih Kondisi -->
      <div v-if="showConditionModal" class="modal-overlay" @click.self="showConditionModal = false">
        <div class="modal-select">
          <h3>Pilih Kondisi</h3>
          <ul>
            <li v-for="cond in conditions" :key="cond" @click="selectCondition(cond)">
              {{ cond }}
            </li>
          </ul>
          <button class="modal-ok" @click="showConditionModal = false">Tutup</button>
        </div>
      </div>

      <!-- Modal Harga -->
      <div v-if="showPriceModal" class="modal-overlay" @click.self="showPriceModal = false">
        <div class="modal-select modal-price">
          <h3>Masukkan Harga</h3>
          <input
            v-model.number="tempPrice"
            type="number"
            min="0"
            placeholder="Masukkan harga"
            class="input-underline"
          />
          <div v-if="priceError" class="price-error">{{ priceError }}</div>
          <div class="modal-price-btns">
            <button class="modal-cancel" @click="showPriceModal = false">Batal</button>
            <button class="modal-save" @click="setPrice">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'

export default {
  name: 'SellProduct',
  setup() {
    const fileInput = ref<HTMLInputElement | null>(null)
    return { fileInput }
  },
  data() {
    return {
      photos: [] as string[], // untuk menyimpan banyak foto
      photo: null as string | null,
      productName: '',
      description: '',
      category: 'Pilih kategori',
      style: 'Pilih style',
      condition: 'Pilih kondisi',
      price: null,
      showSuccessModal: false,
      isLoading: false,
      categories: [
        'Fashion',
        'Furniture',
        'Elektronik',
        'Aksesoris',
        'Sepatu',
        'Tas',
        'Kosmetik',
        'Perlengkapan Rumah',
        'Kacamata',
        'Buku',
        'Lainnya',
      ],
      conditions: ['Baru', 'Bekas', 'Baru dengan tag', 'Bekas seperti baru'],
      styles: ['Batik', 'Casual', 'Formal', 'Sporty', 'Vintage', 'Modern', 'Minimalis', 'Lainnya'],
      showCategoryModal: false,
      showStyleModal: false,
      showConditionModal: false,
      showPriceModal: false,
      tempPrice: null,
      priceError: '',
    }
  },
  computed: {
    hashtagCount() {
      return (this.description.match(/#/g) || []).length
    },
    descriptionWordCount() {
      if (!this.description) return 0
      return this.description.trim().split(/\s+/).filter(Boolean).length
    },
  },
  methods: {
    triggerFileInput() {
      this.fileInput?.click()
    },
    onPhotoChange(event: Event) {
      const files = (event.target as HTMLInputElement).files
      if (!files || !files.length) return
      const maxPhotos = 4
      // Gabungkan foto lama dan baru, lalu ambil maksimal 4
      const newFiles = Array.from(files).slice(0, maxPhotos - this.photos.length)
      const newUrls = newFiles.map((file) => URL.createObjectURL(file as Blob))
      this.photos = [...this.photos, ...newUrls].slice(0, maxPhotos)
      this.photo = this.photos[0] || null
    },
    removePhoto(idx: number) {
      this.photos.splice(idx, 1)
      this.photo = this.photos[0] || null
    },
    selectCategory(cat: string) {
      this.category = cat
      this.showCategoryModal = false
    },
    selectStyle(sty: string) {
      this.style = sty
      this.showStyleModal = false
    },
    selectCondition(cond: string) {
      this.condition = cond
      this.showConditionModal = false
    },
    openPriceModal() {
      this.tempPrice = this.price !== null && this.price !== 'Masukkan harga' ? this.price : null
      this.priceError = ''
      this.showPriceModal = true
    },
    setPrice() {
      if (this.tempPrice === null || this.tempPrice < 0) {
        this.priceError = 'Harga harus lebih dari atau sama dengan 0'
        return
      }
      this.price = this.tempPrice
      this.showPriceModal = false
      this.priceError = ''
    },
    submitForm() {
      if (this.photos.length < 1) {
        alert('Minimal upload 1 foto')
        return
      }
      if (
        !this.productName ||
        !this.description ||
        this.price === null ||
        this.price === 'Masukkan harga' ||
        this.price < 0 ||
        this.category === 'Pilih kategori' ||
        this.style === 'Pilih style' ||
        this.condition === 'Pilih kondisi'
      ) {
        alert('Mohon lengkapi semua data dengan benar')
        return
      }
      this.isLoading = true
      setTimeout(() => {
        this.isLoading = false
        this.showSuccessModal = true
      }, 1500)
    },
    closeForm() {
      alert('Tutup form')
    },
    onDescriptionInput(e: Event) {
      const words = (e.target as HTMLTextAreaElement).value.trim().split(/\s+/).filter(Boolean)
      if (words.length > 500) {
        this.description = words.slice(0, 500).join(' ')
      }
    },
  },
}
</script>

<style scoped>
.sell-container {
  width: 100vw;
  height: 100vh;
  min-width: 0;
  min-height: 0;
  max-width: none;
  max-height: none;
  background: #fff;
  padding: 0;
  border-radius: 0;
  box-sizing: border-box;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  justify-content: center;
  align-items: center;
  margin-top: 0px;
}

.form-wrapper {
  width: 100%;
  max-width: 1200px;
  margin-left: 50px;
  margin-top: -10px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 24px 32px 32px 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  overflow-y: auto;
  margin-top: -20px;
  transition: all 0.3s ease;
  max-height: 90vh;
}

.form-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.header,
.photo-upload,
.form-group {
  padding-left: 0;
  padding-right: 0;
}

.header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  margin-bottom: 28px;
  position: relative;
  padding-left: 12px;
  padding-right: 24px;
  margin-top: -20px;
}

.close-btn {
  position: static;
  font-size: 28px;
  cursor: pointer;
  color: #222;
  font-weight: 400;
  margin-right: 8px;
  margin-left: -20px;
}

.header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #222;
  margin: 0 0 0 8px;
  text-align: left;
}

.photo-upload {
  width: 100%;
  margin-bottom: 20px;
  box-sizing: border-box;
  padding-left: 32px;
  padding-right: 32px;
}

.photo-list {
  display: flex;
  gap: 12px;
  align-items: center;
}

.photo-preview {
  width: 80px;
  height: 80px;
  border: 2px dashed #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.photo-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.add-photo {
  color: #888;
  font-size: 1.1rem;
  border-style: dashed;
}

.uploaded-photo {
  border-style: solid;
  cursor: default;
}

.remove-photo {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: background 0.2s;
}

.remove-photo:hover {
  background: #e11d48;
}

.photo-info {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
}

.form-group {
  width: 100%;
  margin-bottom: 20px;
  box-sizing: border-box;
  padding-left: 32px;
  padding-right: 32px;
}

.form-group label {
  font-weight: 600;
  display: block;
  margin-bottom: 12px;
  color: #222;
  font-size: 1.1rem;
  padding-left: 0;
}

.form-group input,
.form-group textarea {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 1rem; /* Ukuran font input */
  box-sizing: border-box;
  background: #fff;
  color: #222;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group.selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #ececec;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 20px;
  background: transparent;
  padding-left: 32px;
  padding-right: 32px;
}

.form-group.selector label {
  font-weight: 600;
  /* display: block; flex item now */
  margin-bottom: 0;
  color: #222;
  font-size: 1.1rem;

  border-bottom: none;
  padding-bottom: 0;
  width: auto;
  padding-left: 0;
}

.form-group.selector span {
  color: #888;
  font-size: 0.95rem;
  user-select: none;
  margin-left: 10px;
  padding-left: 0;
  padding-right: 0;
}

.desc-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  font-weight: 400;
  padding-left: 13px;
}

.submit-btn {
  width: 120px;
  min-width: 0;
  max-width: 120px;
  margin-left: 32px;
  margin-top: 28px;
  display: block;
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  padding: 14px 0;
  transition: background-color 0.3s ease;
  text-align: center;
}

.submit-btn:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.spinner {
  border: 3px solid transparent;
  border-top: 3px solid white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  display: block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

.modal-success,
.modal-select {
  background: white;
  padding: 24px 32px;
  border-radius: 16px;
  max-width: 360px;
  width: 90%;
  box-sizing: border-box;
  text-align: center;
}

.modal-success h2 {
  margin: 0 0 12px 0;
  font-weight: 600;
  font-size: 1.5rem;
  color: #22c55e;
}

.modal-success p {
  margin: 0 0 24px 0;
  font-size: 1rem;
  color: #333;
}

.modal-ok {
  padding: 10px 20px;
  background: #3b82f6;
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
}

.modal-select {
  background: #f6f2fa;
  padding: 24px 32px;
  border-radius: 24px;
  max-width: 360px;
  width: 90%;
  box-sizing: border-box;
  text-align: left;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.modal-select h3 {
  margin-top: 0;
  margin-bottom: 18px;
  font-weight: 600;
  font-size: 1.2rem;
  text-align: left;
  color: #222;
}

.modal-select ul {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
  max-height: 320px;
  overflow-y: auto;
  border: none;
  border-radius: 0;
  background: transparent;
}

.modal-select li {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  font-size: 1.08rem;
  color: #222;
  background: transparent;
  transition:
    background 0.2s,
    color 0.2s;
}

.modal-select li:last-child {
  border-bottom: none;
}

.modal-select li:hover {
  background: #ede7f6;
  color: #7c4dff;
}

.modal-ok {
  padding: 10px 20px;
  background: none;
  border: none;
  color: #7c4dff;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  margin-top: 8px;
}

.modal-price {
  background: #f6f2fa;
  border-radius: 32px;
  padding: 36px 28px 28px 28px;
  max-width: 340px;
  width: 90vw;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.modal-price h3 {
  margin: 0 0 24px 0;
  font-size: 2rem;
  font-weight: 500;
  color: #222;
}

.input-underline {
  width: 100%;
  border: none;
  border-bottom: 2.5px solid #bbb;
  background: transparent;
  font-size: 1.3rem;
  padding: 16px 0 10px 0;
  margin-bottom: 24px;
  text-align: center;
  outline: none;
  transition: border-color 0.2s;
}

.input-underline:focus {
  border-bottom: 2.5px solid #7c4dff;
}

.price-error {
  color: #e11d48;
  font-size: 0.98rem;
  margin-bottom: 10px;
}

.modal-price-btns {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 18px;
}

.modal-cancel {
  background: none;
  border: none;
  color: #7c4dff;
  font-weight: 500;
  font-size: 1.08rem;
  border-radius: 18px;
  padding: 10px 22px;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-save {
  background: #ede7f6;
  border: none;
  color: #7c4dff;
  font-weight: 600;
  font-size: 1.08rem;
  border-radius: 18px;
  padding: 10px 22px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(124, 77, 255, 0.04);
  transition: background 0.2s;
}

.modal-save:active {
  background: #d1c4e9;
}
</style>
