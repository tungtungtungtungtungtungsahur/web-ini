<template>
    <div class="ktp-verification-container">
      <div class="form-wrapper">
        <div class="info-text">
          <p>Untuk menjual produk, Anda perlu memverifikasi KTP terlebih dahulu.</p>
        </div>

        <!-- Upload KTP -->
        <div class="photo-upload">
          <div class="photo-preview" :class="{ 'has-photo': ktpPhoto }">
            <img v-if="ktpPhoto" :src="ktpPhoto" alt="KTP Preview" />
            <div v-else class="upload-placeholder" @click="triggerFileInput">
              <span>+</span>
              <p>Upload Foto KTP</p>
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="onKTPChange"
            style="display: none"
          />
        </div>

        <!-- NIK Input -->
        <div class="form-group">
          <label>NIK</label>
          <input
            v-model="nik"
            type="text"
            placeholder="Masukkan NIK sesuai KTP"
            maxlength="16"
            @input="validateNIK"
          />
          <span v-if="nikError" class="error-text">{{ nikError }}</span>
        </div>

        <!-- Nama Input -->
        <div class="form-group">
          <label>Nama Lengkap</label>
          <input
            v-model="fullName"
            type="text"
            placeholder="Masukkan nama lengkap sesuai KTP"
          />
        </div>

        <!-- Submit Button -->
        <button class="submit-btn" @click="submitVerification" :disabled="isLoading || !isFormValid">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Verifikasi</span>
        </button>

        <!-- Modal Sukses -->
        <div v-if="showSuccessModal" class="modal-overlay">
          <div class="modal-success">
            <h2>Sukses</h2>
            <p>KTP berhasil diverifikasi</p>
            <button class="modal-ok" @click="onVerificationSuccess">OK</button>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script lang="ts">
  import { defineComponent } from 'vue'
  import { useRouter } from 'vue-router'

  export default defineComponent({
    name: 'KTPVerification',
    setup() {
      const router = useRouter()
      return { router }
    },
    data() {
      return {
        ktpPhoto: null as string | null,
        nik: '',
        fullName: '',
        nikError: '',
        isLoading: false,
        showSuccessModal: false,
      }
    },
    computed: {
      isFormValid(): boolean {
        return !!(
          this.ktpPhoto &&
          this.nik &&
          this.fullName &&
          !this.nikError
        )
      }
    },
    methods: {
      goBack() {
        this.router.back()
      },
      triggerFileInput() {
        ;(this.$refs.fileInput as HTMLInputElement).click()
      },
      onKTPChange(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Mohon upload file gambar')
          return
        }

        // Create preview
        this.ktpPhoto = URL.createObjectURL(file)
      },
      validateNIK() {
        // Remove non-numeric characters
        this.nik = this.nik.replace(/\D/g, '')

        if (this.nik.length > 0 && this.nik.length !== 16) {
          this.nikError = 'NIK harus 16 digit'
        } else {
          this.nikError = ''
        }
      },
      async submitVerification() {
        if (!this.isFormValid) return

        this.isLoading = true

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500))

          // Store verification status in localStorage
          localStorage.setItem('ktpVerified', 'true')

          this.showSuccessModal = true
        } catch (error) {
          alert('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
          this.isLoading = false
        }
      },
      onVerificationSuccess() {
        this.showSuccessModal = false
        this.router.push('/sell')
      }
    }
  })
  </script>

  <style scoped>
  .ktp-verification-container {
    width: 100%;
    min-height: 100vh;
    background: #f5f5f5;
    padding: 32px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
  }

  .form-wrapper {
    width: 100%;
    max-width: 1200px;
    margin: 48px auto 32px auto;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    padding: 48px 48px 40px 48px;
    box-sizing: border-box;
  }

  .info-text {
    text-align: center;
    margin-bottom: 24px;
    color: #666;
  }

  .photo-upload {
    margin-bottom: 24px;
  }

  .photo-preview {
    width: 100%;
    height: 200px;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafbfc;
    overflow: hidden;
    cursor: pointer;
  }

  .photo-preview.has-photo {
    border-style: solid;
    cursor: default;
  }

  .photo-preview img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .upload-placeholder {
    text-align: center;
    color: #888;
  }

  .upload-placeholder span {
    font-size: 36px;
    display: block;
    margin-bottom: 8px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    color: #222;
  }

  .form-group input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
  }

  .error-text {
    color: #e11d48;
    font-size: 0.9rem;
    margin-top: 4px;
    display: block;
  }

  .submit-btn {
    width: 100%;
    background-color: #3b82f6;
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    padding: 12px;
    transition: background-color 0.3s;
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

  .modal-success {
    background: white;
    padding: 24px;
    border-radius: 16px;
    max-width: 360px;
    width: 90%;
    text-align: center;
  }

  .modal-success h2 {
    margin: 0 0 12px;
    font-size: 1.4rem;
    color: #22c55e;
  }

  .modal-success p {
    margin: 0 0 24px;
    color: #333;
  }

  .modal-ok {
    padding: 8px 24px;
    background: #3b82f6;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
  }
  </style>
