<template>
    <div class="page-wrapper">
      <div class="bantuan-wrapper">
        <div class="header">
          <button @click="goBack" class="back-button" aria-label="Kembali">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="title">Bantuan</h1>
        </div>
  
        <div v-for="(item, index) in bantuanList" :key="index" class="faq-card">
          <div class="faq-question" @click="toggle(index)">
            <span>{{ item.pertanyaan }}</span>
            <span class="arrow">{{ item.open ? '▲' : '▼' }}</span>
          </div>
          <transition name="fade">
            <div v-if="item.open" class="faq-answer">
              {{ item.jawaban }}
            </div>
          </transition>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { ref } from 'vue'
  
  const router = useRouter()
  
  const bantuanList = ref([
    {
      pertanyaan: 'Bagaimana cara menjual barang saya?',
      jawaban: 'Masuk ke menu "Katalog Saya", klik tombol tambah, lalu isi data produk yang ingin dijual.',
      open: false
    },
    {
      pertanyaan: 'Bagaimana cara membeli barang?',
      jawaban: 'Cari barang melalui halaman Beranda atau kategori, klik barang yang diinginkan, lalu klik "chat penjual" dan diarahkan ke halaman chat.',
      open: false
    },
    {
      pertanyaan: 'Bagaimana cara menghubungi penjual?',
      jawaban: 'Gunakan fitur Chat di halaman produk untuk bertanya langsung kepada penjual mengenai kondisi barang yang dijual.',
      open: false
    },
    {
      pertanyaan: 'Bagaimana cara menghapus barang dari katalog saya?',
      jawaban: 'Masuk ke menu "Katalog Saya", klik ikon "tempat sampah" di atas.',
      open: false
    },
    {
      pertanyaan: 'Apakah saya bisa mengedit barang yang sudah diunggah?',
      jawaban: 'Tentu. Masuk ke menu "Katalog Saya", klik ikon edit di atas, lalu ubah informasi barang sesuai kebutuhan Anda.',
      open: false
    }
  ])
  
  const toggle = (index: number) => {
    bantuanList.value[index].open = !bantuanList.value[index].open
  }
  
  const goBack = () => {
    router.back()
  }
  </script>
  
  <style scoped>
  .page-wrapper {
  padding: 40px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.bantuan-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  height: 100%;
  color: #333;
}

.back-button .icon {
  width: 28px;
  height: 28px;
  stroke-width: 2.5;
}

.title {
  font-size: 26px;
  font-weight: bold;
  color: #1a1a1a;
  line-height: 1; /* agar tidak terlalu tinggi */
}

.faq-card {
  background-color: #092c33;
  color: white;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.faq-question {
  padding: 16px 20px;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.faq-answer {
  background-color: #174a52;
  padding: 14px 20px;
  font-size: 14px;
  color: #e1e1e1;
}

.arrow {
  font-size: 14px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
  </style>
  