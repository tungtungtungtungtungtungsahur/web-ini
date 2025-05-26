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

      <!-- Error Message -->
      <div v-if="verificationError" class="error-message">
        {{ verificationError }}
      </div>

      <!-- Submit Button -->
      <button class="submit-btn" @click="submitVerification" :disabled="isLoading || !ktpPhoto">
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
import Tesseract from 'tesseract.js'
import { auth, db } from '../firebase'
import { doc, updateDoc } from 'firebase/firestore'

interface TesseractProgress {
  status: string
  progress: number
}

export default defineComponent({
  name: 'KTPVerification',
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      ktpPhoto: null as string | null,
      isLoading: false,
      showSuccessModal: false,
      verificationError: '',
    }
  },
  methods: {
    triggerFileInput() {
      ;(this.$refs.fileInput as HTMLInputElement).click()
    },
    onKTPChange(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.verificationError = 'Mohon upload file gambar'
        return
      }

      // Create preview
      this.ktpPhoto = URL.createObjectURL(file)
      this.verificationError = ''
    },
    async submitVerification() {
      if (!this.ktpPhoto) return

      this.isLoading = true
      this.verificationError = ''

      try {
        const fileInput = this.$refs.fileInput as HTMLInputElement
        const file = fileInput.files?.[0]

        if (!file) {
          throw new Error('No file selected')
        }

        // Use Tesseract.js to recognize text
        const result = await Tesseract.recognize(
          file,
          'ind', // Indonesian language
          {
            logger: (m: TesseractProgress) => {
              if (m.status === 'recognizing text') {
                this.verificationError = 'Memproses gambar...'
              }
            },
          },
        )

        // Check for common KTP patterns
        const text = result.data.text.toLowerCase()
        const requiredPatterns = ['nik', 'nama', 'tempat/tgl lahir', 'alamat']
        const foundPatterns = requiredPatterns.filter((pattern) => text.includes(pattern))

        // Calculate confidence score
        const confidenceScore = foundPatterns.length / requiredPatterns.length

        if (confidenceScore >= 0.75) {
          // Update verification status in Firestore
          const user = auth.currentUser
          if (user) {
            await updateDoc(doc(db, 'users', user.uid), {
              ktpVerified: true,
              ktpVerifiedAt: new Date(),
            })
          }
          this.showSuccessModal = true
        } else {
          this.verificationError = 'Format KTP tidak valid. Silakan upload ulang.'
          // Clear the image and file input
          this.ktpPhoto = null
          const fileInput = this.$refs.fileInput as HTMLInputElement
          if (fileInput) {
            fileInput.value = ''
          }
        }
      } catch (error) {
        console.error('Verification error:', error)
        this.verificationError = 'Terjadi kesalahan. Silakan coba lagi.'
        // Clear the image and file input on error
        this.ktpPhoto = null
        const fileInput = this.$refs.fileInput as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }
      } finally {
        this.isLoading = false
      }
    },
    onVerificationSuccess() {
      this.showSuccessModal = false
      this.router.push('/sell')
    },
  },
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

.error-message {
  color: #e11d48;
  text-align: center;
  margin-bottom: 16px;
  font-size: 0.9rem;
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
