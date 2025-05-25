<script setup lang="ts">
// No imports needed here as we're using router-view
</script>

<template>
  <div class="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/landing">Landing</router-link>
    </nav>

    <router-view />
  </div>
</template>

<style scoped>
.app {
  font-family: Arial, sans-serif;
}

nav {
  padding: 20px;
  text-align: center;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
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
</style>
