<template>
  <div class="sidebar">
    <div class="sidebar-items">
      <div
        v-for="(item, index) in navigationItems"
        :key="index"
        :class="['sidebar-item', { active: selectedIndex === index }]"
        @click="handleItemClick(index)"
      >
        <div class="icon-wrapper">
          <i :class="selectedIndex === index ? item.activeIcon : item.icon"></i>
          <span v-if="item.label === 'Keranjang' && cartCount > 0" class="badge">
            {{ cartCount }}
          </span>
        </div>
        <span class="label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

defineOptions({
  name: 'MainSidebar'
})

const router = useRouter()
const selectedIndex = ref(0)
const cartCount = ref(0)

const navigationItems = [
  {
    icon: 'fas fa-home',
    activeIcon: 'fas fa-home',
    label: 'Beranda',
    route: '/'
  },
  {
    icon: 'fas fa-comment',
    activeIcon: 'fas fa-comment',
    label: 'Pesan',
    route: '/messages'
  },
  {
    icon: 'fas fa-tag',
    activeIcon: 'fas fa-tag',
    label: 'Jual',
    route: '/sell'
  },
  {
    icon: 'fas fa-shopping-cart',
    activeIcon: 'fas fa-shopping-cart',
    label: 'Keranjang',
    route: '/cart'
  },
  {
    icon: 'fas fa-user',
    activeIcon: 'fas fa-user',
    label: 'Akun',
    route: '/akun'
  }
]

const handleItemClick = (index: number) => {
  selectedIndex.value = index
  router.push(navigationItems[index].route)
}

onMounted(() => {
  const cartRef = collection(db, 'cart')
  onSnapshot(cartRef, (snapshot) => {
    cartCount.value = snapshot.size
  })
})
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-items {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
}

.sidebar-item:hover {
  background-color: #f5f5f5;
}

.sidebar-item.active {
  color: #000;
  background-color: #f0f0f0;
}

.icon-wrapper {
  position: relative;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper i {
  font-size: 20px;
}

.label {
  margin-left: 12px;
  font-size: 14px;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ff4444;
  color: white;
  border-radius: 50%;
  min-width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}
</style>
