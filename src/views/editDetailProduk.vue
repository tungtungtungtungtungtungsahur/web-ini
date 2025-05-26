<template>
    <div class="edit-product-container">
      <AppBar />
      <div class="form-wrapper">
        <!-- Upload Foto -->
        <div class="photo-upload">
          <div class="photo-list">
            <!-- Tombol tambah foto -->
            <div
              class="photo-preview add-photo"
              v-if="photos.length < 4"
              @click="triggerFileInput"
            >
              <span>Tambah foto</span>
            </div>
            <!-- Foto yang sudah diupload -->
            <div
              class="photo-preview uploaded-photo"
              v-for="(url, idx) in photos"
              :key="url"
            >
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
            style="display:none"
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
          <textarea v-model="description" @input="onDescriptionInput" placeholder="Deskripsi produk"></textarea>
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
          <span>{{ price !== null && price !== 'Masukkan harga' ? 'Rp ' + price : 'Masukkan harga' }}</span>
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
              <li v-for="cond in conditions" :key="cond" @click="selectCondition(cond)">{{ cond }}</li>
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
  import { defineComponent, ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { db, auth, storage } from '../firebase';
  import { doc, getDoc, setDoc } from 'firebase/firestore';
  import { uploadBytes, ref as storageRef, getDownloadURL, deleteObject } from 'firebase/storage';
  import AppBar from '@/components/AppBar.vue';

  export default defineComponent({
    name: 'EditDetailProduk',
    components: {
      AppBar
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const productId = route.params.productId; // Get product ID from route

      // Reactive data properties, initialized potentially with default or empty values
      const photos = ref([]);
      const productName = ref('');
      const description = ref('');
      const category = ref('Pilih kategori');
      const style = ref('Pilih style');
      const condition = ref('Pilih kondisi');
      const price = ref(null);
      const showSuccessModal = ref(false);
      const isLoading = ref(false);
      const priceError = ref('');
      const tempPrice = ref(null);
      const showPriceModal = ref(false);

      // Options for select fields (might need to be fetched or defined elsewhere for a real app)
      const categories = [
        'Fashion', 'Furniture', 'Elektronik', 'Aksesoris', 'Sepatu', 'Tas', 'Kosmetik',
        'Perlengkapan Rumah', 'Kacamata', 'Buku', 'Lainnya'
      ];
      const conditions = [
        'Baru', 'Bekas', 'Baru dengan tag', 'Bekas seperti baru'
      ];
      const styles = [
        'Batik', 'Casual', 'Formal', 'Sporty', 'Vintage', 'Modern', 'Minimalis', 'Lainnya'
      ];

      onMounted(async () => {
        // Fetch product data from Firebase
        if (productId) {
          try { // Added try-catch for fetching
            const productRef = doc(db, 'products', productId as string);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
              const productData = productSnap.data();
              // Populate form fields with fetched data
              productName.value = productData.name || '';
              description.value = productData.description || '';
              category.value = productData.category || 'Pilih kategori';
              style.value = productData.style || 'Pilih style';
              condition.value = productData.condition || 'Pilih kondisi';
              price.value = productData.price !== undefined ? productData.price : null;
              photos.value = productData.images || [];
              console.log('Fetched and populated product data:', productData); // Keep log for debugging
            } else {
              console.error('Product with ID not found:', productId);
              // Optionally handle product not found (e.g., redirect)
            }
          } catch (error) {
            console.error('Error fetching product data:', error);
            // Optionally show a user-friendly error message without dedicated UI elements
          }
        } else {
          console.error('No product ID provided in route parameters.');
          // Optionally handle missing ID
        }
      });

      // Methods (adapted to use ref values)
      const triggerFileInput = () => {
        (document.querySelector('input[type="file"]') as HTMLInputElement).click();
      };

      const onPhotoChange = (event) => {
        const files = event.target.files;
        if (!files.length) return;
        const maxPhotos = 4;
        const currentPhotosCount = photos.value.length;
        const filesToAdd = Array.from(files).slice(0, maxPhotos - currentPhotosCount);

        filesToAdd.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            photos.value.push(e.target.result as string); // Use result for data URL
          };
          reader.readAsDataURL(file);
        });
      };

      const removePhoto = (idx) => {
        photos.value.splice(idx, 1);
      };

      const selectCategory = (cat) => {
        category.value = cat;
        // Close modal logic needs to be implemented separately or handled by parent
      };

      const selectStyle = (sty) => {
        style.value = sty;
        // Close modal logic
      };

      const selectCondition = (cond) => {
        condition.value = cond;
        // Close modal logic
      };

      const openPriceModal = () => {
        tempPrice.value = price.value;
        showPriceModal.value = true;
        priceError.value = '';
      };

      const setPrice = () => {
        if (tempPrice.value === null || tempPrice.value < 0) {
          priceError.value = 'Harga harus lebih dari atau sama dengan 0';
          return;
        }
        price.value = tempPrice.value;
        showPriceModal.value = false;
        priceError.value = '';
      };

      const submitForm = async () => {
        if (photos.value.length < 1) {
          alert('Minimal upload 1 foto')
          return
        }
        if (!productName.value || !description.value || price.value === null || price.value < 0 || category.value === 'Pilih kategori' || style.value === 'Pilih style' || condition.value === 'Pilih kondisi') {
          alert('Mohon lengkapi semua data dengan benar')
          return
        }

        isLoading.value = true

        try {
          const user = auth.currentUser
          if (!user) {
            console.error('User not logged in.')
            alert('Anda harus login untuk mengedit produk.')
            isLoading.value = false
            return
          }

          // Get the original product data to compare images
          const productRef = doc(db, 'products', productId as string)
          const productSnap = await getDoc(productRef)
          const originalProduct = productSnap.data()
          const originalImages = originalProduct?.images || []

          // Handle image uploads
          const imageUrls: string[] = []
          for (const photo of photos.value) {
            // If the photo is a data URL (new upload), upload it to storage
            if (photo.startsWith('data:')) {
              const response = await fetch(photo)
              const blob = await response.blob()
              const timestamp = new Date().getTime()
              const storagePath = `products/${user.uid}/${timestamp}_${Math.random().toString(36).substring(7)}`
              const imageRef = storageRef(storage, storagePath)
              await uploadBytes(imageRef, blob)
              const downloadURL = await getDownloadURL(imageRef)
              imageUrls.push(downloadURL)
            } else {
              // If it's an existing URL, keep it
              imageUrls.push(photo)
            }
          }

          // Delete removed images from storage
          for (const originalImage of originalImages) {
            if (!imageUrls.includes(originalImage)) {
              try {
                const imageRef = storageRef(storage, originalImage)
                await deleteObject(imageRef)
              } catch (error) {
                console.error('Error deleting old image:', error)
              }
            }
          }

          // Update product data
          const updatedData = {
            name: productName.value,
            description: description.value,
            category: category.value,
            style: style.value,
            condition: condition.value,
            price: price.value,
            images: imageUrls,
            updatedAt: new Date()
          }

          await setDoc(productRef, updatedData, { merge: true })
          isLoading.value = false
          showSuccessModal.value = true
          console.log('Product updated successfully!')

          // Navigate back after successful update
          setTimeout(() => {
            router.push('/akun')
          }, 1500)
        } catch (error) {
          console.error('Error updating product:', error)
          isLoading.value = false
          alert('Gagal menyimpan perubahan produk. Silakan coba lagi.')
        }
      }

      const closeForm = () => {
        router.go(-1); // Navigate back to the previous page
      };

      const onDescriptionInput = (e) => {
        const words = e.target.value.trim().split(/\s+/).filter(Boolean);
        if (words.length > 500) {
          description.value = words.slice(0, 500).join(' ');
        }
      };

      // Expose reactive properties and methods to the template
      return {
        photos,
        productName,
        description,
        category,
        style,
        condition,
        price,
        showSuccessModal,
        isLoading,
        categories,
        conditions,
        styles,
        showCategoryModal: ref(false),
        showStyleModal: ref(false),
        showConditionModal: ref(false),
        showPriceModal,
        tempPrice,
        priceError,
        hashtagCount: computed(() => (description.value.match(/#/g) || []).length),
        descriptionWordCount: computed(() => description.value.trim().split(/\s+/).filter(Boolean).length),
        triggerFileInput,
        onPhotoChange,
        removePhoto,
        selectCategory,
        selectStyle,
        selectCondition,
        openPriceModal,
        setPrice,
        submitForm,
        closeForm,
        onDescriptionInput,
      };
    },
  });
  </script>

  <style scoped>
  .edit-product-container {
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
    padding-top: 80px;
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
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    z-index: 10;
    justify-content: left;
    align-items: left;
    padding-left: 80px; /* Set left padding for sidebar clearance */
  }

  .back-arrow {
    position: static;
    font-size: 28px;
    cursor: pointer;
    color: #fff;
    font-weight: 400;
    margin-right: 50px;
    margin-left: -50px;
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
    margin: 80px auto 20px auto; /* Adjusted top margin to clear fixed header with padding */
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    padding: 24px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    overflow-y: auto;
    transition: all 0.3s ease;
    max-height: calc(100vh - 100px); /* Re-evaluate if this max-height is correct */
  }

  .form-wrapper:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
  }

  .photo-upload {
    width: 100%;
    margin-bottom: 20px;
    box-sizing: border-box;
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 20px;
    border-bottom: 1px solid #ccc;
  }

  .photo-list {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: center;
  }

  .photo-preview {
    width: 120px;
    height: 120px;
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
    font-size: 1rem;
    border-style: dashed;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .uploaded-photo {
    border-style: solid;
    cursor: default;
  }

  .remove-photo {
    position: absolute;
    top: 2px;
    right: 2px;
    background: rgba(0,0,0,0.5);
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
    font-size: 12px;
    color: #888;
    margin-top: 8px;
    text-align: center;
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
    to { transform: rotate(360deg); }
  }

  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99;
  }

  .modal-success, .modal-select {
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
    box-shadow: 0 4px 24px rgba(0,0,0,0.10);
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
    transition: background 0.2s, color 0.2s;
  }

  .modal-select li:last-child {
    border-bottom: none;
  }

  .modal-select li:hover {
    background: #ede7f6;
    color: #7c4dff;
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
    box-shadow: 0 4px 24px rgba(0,0,0,0.10);
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
    box-shadow: 0 2px 8px rgba(124,77,255,0.04);
    transition: background 0.2s;
  }

  .modal-save:active {
    background: #d1c4e9;
  }
  </style>
