<template>
    <div class="Biodata-product-container">
      <!-- Header (outside form-wrapper) -->
      <div class="header">
        <span class="back-arrow" @click="closeForm">&leftarrow;</span>
        <h2>BioData Toko</h2>
      </div>
  
      <div class="form-wrapper">
        <!-- Deskripsi -->
        <div class="form-group">
          <label>Deskripsi</label>
          <textarea
            v-model="description"
            @input="onDescriptionInput"
            placeholder="Masukkan deskripsi terkait produk"
          ></textarea>
          <div class="desc-info">
            <span>Hashtag: {{ hashtagCount }}</span>
            <span>{{ descriptionWordCount }}/500 kata</span>
          </div>
        </div>
  
        <!-- Lokasi -->
        <div class="form-group selector" @click="showLokasiModal = true">
          <label>Lokasi</label>
          <div class="value-container">
            <span>{{ selectedLokasiDisplay || 'Masukkan lokasi toko' }}</span>
            <span class="arrow">></span>
          </div>
        </div>
  
        <!-- Kategori, Style, Kondisi, Harga -->
        <div class="form-group selector" @click="showKategoriModal = true">
          <label>Kategori</label>
          <div class="category-container">
            <span v-if="selectedKategori.length === 0">Pilih kategori (hingga 3)</span>
            <span v-for="cat in selectedKategori" :key="cat" class="category-tag">{{ cat }}</span>
            <span class="arrow">></span>
          </div>
        </div>
        <div class="form-group selector" @click="showJamOperasionalModal = true">
          <label>Jam Operasional</label>
          <div class="value-container">
            <span>{{ displayJamOperasional || 'Atur jam operasional' }}</span>
            <span class="arrow">></span>
          </div>
        </div>
        <div class="form-group selector" @click="showKontakModal = true">
          <label>Kontak</label>
          <div class="value-container">
            <span>{{ kontak || 'Masukkan nomor kontak' }}</span>
            <span class="arrow">></span>
          </div>
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
            <p>Biodata toko berhasil disimpan</p>
            <button class="modal-ok" @click="closeSuccessModalAndNavigate">OK</button>
          </div>
        </div>
  
        <!-- Modal Lokasi -->
        <div v-if="showLokasiModal" class="modal-overlay" @click.self="showLokasiModal = false">
          <div class="modal-select modal-price">
            <h3>Masukkan Lokasi</h3>
            <input
              v-model="lokasiInputModal"
              type="text"
              placeholder="Masukkan lokasi toko"
              class="input-underline"
            />
            <div class="modal-price-btns">
              <button class="modal-cancel" @click="showLokasiModal = false">Batal</button>
              <button class="modal-save" @click="setLokasi">Simpan</button>
            </div>
          </div>
        </div>
  
        <!-- Modal Kategori -->
        <div v-if="showKategoriModal" class="modal-overlay" @click.self="showKategoriModal = false">
          <div class="modal-select">
            <h3>Pilih Kategori (hingga 3)</h3>
            <ul>
              <li
                v-for="cat in kategoriOptions"
                :key="cat"
                @click="toggleKategori(cat)"
                :class="{ selected: selectedKategori.includes(cat) }"
              >
                {{ cat }}
              </li>
            </ul>
            <button class="modal-ok" @click="showKategoriModal = false">Selesai</button>
          </div>
        </div>
  
        <!-- Modal Jam Operasional -->
        <div v-if="showJamOperasionalModal" class="modal-overlay" @click.self="showJamOperasionalModal = false">
          <div class="modal-select modal-price">
            <h3>Atur Jam Operasional</h3>
            <input
              v-model="tempJamOperasional"
              type="text"
              placeholder="Masukkan jam operasional"
              class="input-underline"
            />
            <div class="modal-price-btns">
              <button class="modal-cancel" @click="showJamOperasionalModal = false">Batal</button>
              <button class="modal-save" @click="setJamOperasional">Simpan</button>
            </div>
          </div>
        </div>
  
        <!-- Modal Kontak -->
        <div v-if="showKontakModal" class="modal-overlay" @click.self="showKontakModal = false">
          <div class="modal-select modal-price">
            <h3>Masukkan Nomor Kontak</h3>
            <input
              v-model="tempKontak"
              type="tel"
              placeholder="Masukkan nomor HP"
              class="input-underline"
            />
            <div class="modal-price-btns">
              <button class="modal-cancel" @click="showKontakModal = false">Batal</button>
              <button class="modal-save" @click="setKontak">Simpan</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue'
  import { auth, db } from '../firebase' // Import auth and db
  import { doc, getDoc, setDoc } from 'firebase/firestore' // Import Firestore functions
  import { onAuthStateChanged } from 'firebase/auth' // Import Auth state listener
  
  export default defineComponent({
    name: 'BioDataToko',
    data() {
      return {
        photos: [] as string[],
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
        selectedLokasi: null,
        showLokasiModal: false,
        lokasiOptions: ['Bengkulu', 'Jakarta', 'Bandung', 'Surabaya'],
        selectedKategori: [],
        showKategoriModal: false,
        kategoriOptions: [
          'Furniture',
          'Elektronik',
          'Fashion',
          'Aksesoris',
          'Sepatu',
          'Tas',
          'Kosmetik',
          'Perlengkapan Rumah',
          'Kacamata',
          'Buku',
          'Lainnya',
        ],
        jamOperasional: '',
        tempJamOperasional: '',
        showJamOperasionalModal: false,
        kontak: null,
        tempKontak: null,
        showKontakModal: false,
        lokasiInputModal: '',
        selectedLokasiDisplay: null,
      }
    },
    created() {
      // Fetch existing biodata when component is created
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const storeRef = doc(db, 'stores', user.uid);
          const storeSnap = await getDoc(storeRef);

          if (storeSnap.exists()) {
            const storeData = storeSnap.data();
            // Populate form fields with fetched data
            this.description = storeData.description || '';
            this.selectedLokasiDisplay = storeData.location || null;
            this.selectedKategori = storeData.categories || [];
            this.jamOperasional = storeData.operatingHours || '';
            this.kontak = storeData.contact || null;
          }
        } else {
          // Handle case where user is not logged in, maybe redirect
          console.log('User not logged in, cannot fetch biodata');
        }
      });
    },
    computed: {
      hashtagCount() {
        return (this.description.match(/#/g) || []).length
      },
      descriptionWordCount() {
        if (!this.description) return 0
        return this.description.trim().split(/\s+/).filter(Boolean).length
      },
      displayJamOperasional() {
        return this.jamOperasional;
      },
    },
    methods: {
      triggerFileInput() {
        ;(this.$refs.fileInput as HTMLInputElement).click()
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
      async submitForm() {
        // Validate store biodata fields
        if (
          !this.description ||
          !this.selectedLokasiDisplay ||
          this.selectedKategori.length === 0 ||
          !this.jamOperasional ||
          !this.kontak
        ) {
          alert('Mohon lengkapi semua data biodata toko dengan benar.');
          return;
        }

        this.isLoading = true;

        try {
          const user = auth.currentUser;
          if (user) {
            const storeRef = doc(db, 'stores', user.uid);
            await setDoc(storeRef, {
              description: this.description,
              location: this.selectedLokasiDisplay,
              categories: this.selectedKategori,
              operatingHours: this.jamOperasional,
              contact: this.kontak,
              // Add any other relevant fields here
            }, { merge: true }); // Use merge: true to not overwrite other potential fields

            this.isLoading = false;
            this.showSuccessModal = true; // Show success modal

          } else {
            console.error('User not logged in, cannot save biodata');
            this.isLoading = false;
            // Optionally show an error message to the user
          }
        } catch (error) {
          console.error('Error saving biodata:', error);
          this.isLoading = false;
          // Optionally show a more user-friendly error message
          alert('Gagal menyimpan biodata. Silakan coba lagi.');
        }
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
      setLokasi() {
        if(this.lokasiInputModal) {
          this.selectedLokasiDisplay = this.lokasiInputModal;
          this.showLokasiModal = false;
        } else {
          alert('Mohon masukkan lokasi');
        }
      },
      toggleKategori(kategori) {
        const index = this.selectedKategori.indexOf(kategori);
        if (index > -1) {
          this.selectedKategori.splice(index, 1); 
        } else {
          if (this.selectedKategori.length < 3) {
            this.selectedKategori.push(kategori); 
          } else {
            alert('Anda hanya dapat memilih hingga 3 kategori.');
          }
        }
      },
      setJamOperasional() {
        if(this.tempJamOperasional) {
          this.jamOperasional = this.tempJamOperasional;
          this.showJamOperasionalModal = false;
        } else {
          alert('Mohon masukkan jam operasional');
        }
      },
      setKontak() {
        if(this.tempKontak) {
          this.kontak = this.tempKontak;
          this.showKontakModal = false;
        } else {
          alert('Mohon masukkan nomor kontak');
        }
      },
      closeSuccessModalAndNavigate() {
        this.showSuccessModal = false;
        this.$router.push('/akunTokoSisiPenjual');
      }
    },
  })
  </script>
  
  <style scoped>
  .Biodata-product-container {
    width: 100vw;
    height: 100vh;
    min-width: 0;
    min-height: 0;
    max-width: none;
    max-height: none;
    background: #f6f2fa;
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
    margin-top: 0;
  }
  
  .header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    margin-bottom: 20px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 16px 24px;
    background: #2c3e50;
    box-sizing: border-box;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    z-index: 10;
    justify-content: left;
    align-items: left;
  }
  
  .back-arrow {
    position: static;
    font-size: 28px;
    cursor: pointer;
    color: #fff;
    font-weight: 400;
    margin-right: 12px;
    margin-left: 0;
  }
  
  .header h2 {
    font-size: 1.4rem;
    font-weight: 500;
    color: #ffff;
    margin: 0;
    text-align: left;
  }
  
  .form-wrapper {
    width: 100%;
    max-width: 1200px;
    margin: 100px auto 20px auto;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    padding: 24px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    overflow-y: hidden;
    transition: all 0.3s ease;
    max-height: auto;
  }
  
  .form-wrapper:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }
  
  
  .form-group {
    width: 100%;
    margin-bottom: 20px;
    box-sizing: border-box;
    padding: 0;
    border-bottom: 1px solid #ccc;
    display: block;
  }
  
  .form-group label {
    font-weight: 600;
    display: block;
    margin-bottom: 8px;
    color: #222;
    font-size: 1rem;
    padding-left: 0;
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding: 0;
    border-radius: 0;
    border: none;
    font-size: 1.1rem;
    box-sizing: border-box;
    background: transparent;
    color: #222;
  }
  
  .form-group textarea {
    min-height: 80px;
    resize: vertical;
  }
  
  .form-group.selector {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    border-bottom: 1px solid #ccc;
    padding: 12px 0;
    margin-bottom: 20px;
    background: transparent;
  }
  
  .form-group.selector label {
    font-weight: 600;
    margin-bottom: 0;
    color: #222;
    font-size: 1rem;
    padding-left: 0;
    flex-shrink: 0;
    margin-right: 16px;
  }
  
  .form-group.selector span {
    color: #888;
    font-size: 1rem;
    user-select: none;
    margin-left: auto;
    padding-left: 0;
    padding-right: 0;
    text-align: right;
    flex-grow: 1;
  }
  
  .desc-info {
    display: flex;
    justify-content: flex-end;
    color: #999;
    font-weight: 400;
    padding-left: 0;
    font-size: 11px;
    margin-top: 4px;
    margin-bottom: 8px;
  }
  
  .submit-btn {
    width: 30%;
    display: block;
    background-color: #3b82f6;
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    padding: 12px 0;
    transition: background-color 0.3s ease;
    text-align: center;
    margin: 24px auto 0 auto;
  }
  
  .submit-btn:disabled {
    background-color: #a5b4fc;
    cursor: not-allowed;
  }
  
  .spinner {
    border: 3px solid transparent;
    border-top: 3px solid white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
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
    padding: 20px 28px;
    border-radius: 16px;
    max-width: 360px;
    width: 90%;
    box-sizing: border-box;
    text-align: center;
  }
  
  .modal-success h2 {
    margin: 0 0 12px 0;
    font-size: 1.4rem;
    color: #22c55e;
  }
  
  .modal-success p {
    margin: 0 0 24px 0;
    font-size: 0.95rem;
    color: #333;
  }
  
  .modal-ok {
    padding: 8px 16px;
    background: #3b82f6;
    border: none;
    border-radius: 12px;
    color: white;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
  }
  
  .modal-select {
    background: #f6f2fa;
    padding: 20px 28px;
    border-radius: 24px;
    max-width: 360px;
    width: 90%;
    box-sizing: border-box;
    text-align: left;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  }
  
  .modal-select h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-weight: 600;
    font-size: 1.1rem;
    text-align: left;
    color: #222;
  }
  
  .modal-select ul {
    list-style: none;
    padding: 0;
    margin: 0 0 12px 0;
    max-height: 320px;
    overflow-y: auto;
    border: none;
    border-radius: 0;
    background: transparent;
  }
  
  .modal-select li {
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    font-size: 1rem;
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
  
  .modal-select li.selected {
    background-color: #e0e0e0;
    font-weight: bold;
  }
  
  .modal-ok {
    padding: 8px 16px;
    background: none;
    border: none;
    color: #7c4dff;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    border-radius: 8px;
    margin-top: 4px;
  }
  
  .modal-price {
    background: #f6f2fa;
    border-radius: 24px;
    padding: 28px 24px 24px 24px;
    max-width: 340px;
    width: 90vw;
    box-sizing: border-box;
    text-align: center;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  }
  
  .input-underline {
    width: 100%;
    border: none;
    border-bottom: 2.5px solid #bbb;
    background: transparent;
    font-size: 1.2rem;
    padding: 12px 0 8px 0;
    margin-bottom: 20px;
    text-align: center;
    outline: none;
    transition: border-color 0.2s;
  }
  
  .input-underline:focus {
    border-bottom: 2.5px solid #7c4dff;
  }
  
  .price-error {
    color: #e11d48;
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
  
  .modal-price-btns {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
  }
  
  .modal-cancel {
    background: none;
    border: none;
    color: #7c4dff;
    font-weight: 600;
    font-size: 1rem;
    border-radius: 18px;
    padding: 8px 20px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .modal-save {
    background: #ede7f6;
    border: none;
    color: #7c4dff;
    font-weight: 600;
    font-size: 1rem;
    border-radius: 18px;
    padding: 8px 20px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(124, 77, 255, 0.04);
    transition: background 0.2s;
  }
  
  .modal-save:active {
    background: #d1c4e9;
  }
  
  .value-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #222;
    font-size: 1rem;
  }
  
  .arrow {
    font-size: 1rem;
    color: #888;
  }
  
  .category-container {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap; 
  }
  
  .category-tag {
    background-color: #ddd;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    color: #555;
  }
  
  .text-input {
    width: 100%;
    padding: 8px 0;
    border: none;
    border-bottom: 1px solid #ccc;
    font-size: 1rem;
    color: #222;
    background: transparent;
    outline: none;
  }
  </style>
  