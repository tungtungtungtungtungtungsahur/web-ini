<template>
  <div class="ktp-verification-container">
    <div class="header">
      <span class="back-arrow" @click="goBack">&leftarrow;</span>
      <h2>Verifikasi KTP</h2>
    </div>

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

      <!-- Progress Bar -->
      <div v-if="isLoading" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${verificationProgress}%` }"></div>
        </div>
        <div class="progress-text">{{ verificationProgress }}%</div>
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
import Tesseract from 'tesseract.js'

interface OCRResult {
  text: string
  confidence: number
}

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
      ktpFile: null as File | null,
      isLoading: false,
      showSuccessModal: false,
      verificationProgress: 0,
      isVerifying: false,
      ocrResult: null as OCRResult | null,
    }
  },
  computed: {
    isFormValid(): boolean {
      return !!this.ktpFile && !this.isLoading
    },
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

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 5MB')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Basic image validation
          const isMinSize = img.width >= 200 && img.height >= 150

          if (!isMinSize) {
            alert('Kualitas foto terlalu rendah. Mohon ambil foto dengan resolusi lebih tinggi')
            this.ktpPhoto = null
            this.ktpFile = null
            return
          }

          this.ktpPhoto = URL.createObjectURL(file)
          this.ktpFile = file
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    },

    async submitVerification() {
      if (!this.isFormValid || !this.ktpFile) return

      this.isLoading = true
      this.isVerifying = true
      this.verificationProgress = 0

      try {
        // Create image from file
        const img = new Image()
        img.src = URL.createObjectURL(this.ktpFile)

        // Wait for image to load
        await new Promise((resolve) => {
          img.onload = resolve
        })

        // Perform OCR with better configuration
        this.verificationProgress = 30
        const result = await Tesseract.recognize(
          img,
          'ind', // Indonesian language
          {
            logger: (m: { status: string; progress: number }) => {
              if (m.status === 'recognizing text') {
                this.verificationProgress = 30 + m.progress * 40
              }
            },
            tessedit_char_whitelist:
              '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,/- ', // Allow only these characters
            tessedit_pageseg_mode: '6', // Assume uniform text block
          },
        )

        this.verificationProgress = 70
        const text = result.data.text.toLowerCase()
        console.log('OCR Result:', text) // For debugging

        // Extract NIK (16 digits) - More lenient pattern for validation
        const nikMatch =
          text.match(/\b\d{16}\b/) ||
          text.match(/\b\d{1,3}[-\s]?\d{1,3}[-\s]?\d{1,3}[-\s]?\d{1,3}[-\s]?\d{1,3}[-\s]?\d{1,3}\b/)
        if (!nikMatch) {
          alert(
            'Verifikasi Gagal: Tidak dapat menemukan NIK yang valid pada KTP. Mohon pastikan foto KTP jelas dan tidak terpotong.',
          )
          this.ktpPhoto = null
          this.ktpFile = null
          return
        }
        const extractedNik = nikMatch[0].replace(/[-\s]/g, '') // Cleaned NIK for internal check

        // Extract Nama Lengkap - More lenient pattern for validation
        const namaPatterns = [
          /nama\s*:?\s*([^\n]+)/i,
          /nama\s+lengkap\s*:?\s*([^\n]+)/i,
          /nama\s+orang\s*:?\s*([^\n]+)/i,
        ]

        let namaMatch = null
        for (const pattern of namaPatterns) {
          namaMatch = text.match(pattern)
          if (namaMatch) break
        }

        if (!namaMatch) {
          alert(
            'Verifikasi Gagal: Tidak dapat menemukan nama lengkap pada KTP. Mohon pastikan foto KTP jelas dan tidak terpotong.',
          )
          this.ktpPhoto = null
          this.ktpFile = null
          return
        }
        const extractedFullName = namaMatch[1].trim() // Cleaned name for internal check

        // Check for KTP-specific keywords - More lenient matching
        const ktpKeywords = [
          'ktp',
          'kartu',
          'penduduk',
          'provinsi',
          'kabupaten',
          'kota',
          'kecamatan',
          'kelurahan',
          'desa',
          'rt',
          'rw',
        ]

        // Count how many keywords are found
        const foundKeywords = ktpKeywords.filter((keyword) => text.includes(keyword))
        const hasKtpKeywords = foundKeywords.length >= 3 // Require at least 3 keywords to match

        if (!hasKtpKeywords) {
          console.log('Found keywords:', foundKeywords) // For debugging
          alert(
            'Verifikasi Gagal: Dokumen yang diupload mungkin bukan KTP yang valid. Mohon pastikan foto KTP jelas dan tidak terpotong.',
          )
          this.ktpPhoto = null
          this.ktpFile = null
          return
        }

        // If all checks pass, consider it valid
        this.verificationProgress = 100
        this.ocrResult = result.data

        console.log('Validation Successful!') // For debugging
        console.log('Extracted NIK (internal):', extractedNik)
        console.log('Extracted Nama (internal):', extractedFullName)
        console.log('Found Keywords:', foundKeywords) // For debugging

        // Store verification status and user data in localStorage (optional, based on flow)
        // localStorage.setItem('ktpVerified', 'true')
        // localStorage.setItem('userNIK', extractedNik) // Store if needed later
        // localStorage.setItem('userFullName', extractedFullName) // Store if needed later
        // localStorage.setItem('verificationDate', new Date().toISOString())

        this.showSuccessModal = true // Show success modal on valid KTP
      } catch (error: unknown) {
        console.error('Verification error:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.'
        alert(`Verifikasi Gagal: ${errorMessage}`)
        this.ktpPhoto = null
        this.ktpFile = null
      } finally {
        this.isLoading = false
        this.isVerifying = false
        this.verificationProgress = 0
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
  width: 100vw;
  height: 100vh;
  background: #f6f2fa;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
}

.header {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: #1b2a30;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.back-arrow {
  font-size: 28px;
  cursor: pointer;
  color: #fff;
  margin-right: 12px;
}

.header h2 {
  font-size: 1.4rem;
  font-weight: 500;
  color: #fff;
  margin: 0;
}

.form-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 100px auto 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 24px;
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

.progress-container {
  margin-top: 20px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #666;
}

.extracted-data {
  margin-top: 20px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.extracted-data .form-group input {
  background-color: #f1f5f9;
  cursor: not-allowed;
}
</style>
