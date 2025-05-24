<template>
  <div class="home-page">
    <h1>Home Page</h1>
    <FirebaseTest />
  </div>
</template>

<script setup lang="ts">
import FirebaseTest from '../components/FirebaseTest.vue'

defineOptions({
  name: 'HomePage',
})
</script>

<style scoped>
.home-page {
  padding: 20px;
  text-align: center;
}
</style>
