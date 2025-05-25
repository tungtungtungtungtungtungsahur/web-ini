<template>
  <div class="tentang-toko-page">
    <header class="header">
      <div class="header-content">
        <button class="back-button">←</button>
        <h1>Akun Saya</h1>
      </div>
    </header>

    <section class="profile-section">
      <div class="profile-image">
        <img :src="profileImageUrl" alt="Profile Picture">
      </div>
      <div class="profile-info">
        <h2>putri</h2>
        <p>@putriAja <span class="verified-badge">Terverifikasi</span></p>
        <p>📍 Bandung</p>
      </div>
    </section>

    <nav class="tabs">
      <button
        :class="{ 'tab-button': true, 'active': activeTab === 'Barang' }"
        @click="activeTab = 'Barang'"
      >
        Barang
      </button>
      <button
        :class="{ 'tab-button': true, 'active': activeTab === 'Tentang' }"
        @click="activeTab = 'Tentang'"
      >
        Tentang
      </button>
    </nav>

    <section class="barang-section" v-if="activeTab === 'Barang'">
      <div class="barang-list">
        <p>This is where the list of products for this account will be displayed.</p>
      </div>
    </section>

    <section class="tentang-section" v-if="activeTab === 'Tentang'">
      <div class="info-container">
        <div class="info-item">
          <span class="icon">📄</span>
          <div class="text-content">
            <h3>Deskripsi</h3>
            <p>Toko merupakan toko penjualan elektronik dan perabotan rumah terpecaya, bagi yang percaya aja😊</p>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">📍</span>
          <div class="text-content">
            <h3>Lokasi</h3>
            <p>Bandung Kota</p>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">👥</span>
          <div class="text-content">
            <h3>Kategori</h3>
            <p>Furniture, Elektronik</p>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">📞</span>
          <div class="text-content">
            <h3>Kontak</h3>
            <p>0812121212</p>
          </div>
        </div>
        <div class="info-item">
          <span class="icon">⏰</span>
          <div class="text-content">
            <h3>Jam Operasional</h3>
            <p>Senin, 08:00-23:59</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AkunTokoSisiPenjual',
  data() {
    return {
      profileImageUrl: '',
      activeTab: 'Tentang',
    };
  },
  created() {
    // Implement your Firebase logic here to fetch the image URL
    // For example:
    // const userId = 'some_user_id'; // Get the user ID for the account
    // firebase.storage().ref(`profile_pictures/${userId}.jpg`).getDownloadURL()
    //   .then((url) => {
    //     this.profileImageUrl = url;
    //   })
    //   .catch((error) => {
    //     console.error('Error fetching profile image:', error);
    //     // Handle errors, maybe set a default image
    //   });
  },
}
</script>

<style scoped>
.tentang-toko-page {
  padding: 0;
  overflow: hidden;
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
  background: #1b2a30;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 10;
  justify-content: left;
  align-items: left;
}

body {
  margin: 0;
  padding: 0;
}

#app {
  margin: 0;
  padding: 0;
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 20px;
}

.back-button {
  margin-right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
}

.header h1 {
  margin: 0;
  font-size: 1.2em;
  color: white;
}

.profile-section,
.tabs {
  padding: 0 20px;
}

.profile-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.profile-image img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 20px;
}

.verified-badge {
  background-color: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.rating span {
  font-weight: bold;
  margin-right: 5px;
}

.tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
}

.tab-button {
  padding: 10px 0;
  margin: 0 10px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1em;
}

.tab-button.active {
  border-bottom: 2px solid #000;
  font-weight: bold;
}

.tentang-section {
  padding: 0 20px;
}

.info-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 0;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.info-item .icon {
  margin-right: 15px;
  font-size: 1.5em;
}

.info-item h3 {
  margin: 0 0 5px 0;
  font-size: 1em;
}

.info-item p {
  margin: 0;
  color: #555;
}

.barang-section {
  padding: 0 20px;
}

.barang-list {
  /* Add styles for your product list layout */
}
</style>