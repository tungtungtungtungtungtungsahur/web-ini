<template>
    <div class="page-wrapper">
      <div class="bantuan-wrapper">
        <div class="header">
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
  import { ref } from 'vue'

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
  </script>

  <script lang="ts">
  export default {
    name: 'BantuanPage'
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
  margin-bottom: 30px;
}

.title {
  font-size: 26px;
  font-weight: bold;
  color: #1a1a1a;
  line-height: 1;
}

.faq-card {
  background-color: #e53935;
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
  background-color: #b71c1c;
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
