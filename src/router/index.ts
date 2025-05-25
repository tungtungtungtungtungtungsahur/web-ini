import { createRouter, createWebHistory } from 'vue-router'
import Signin from '../views/signin.vue'
import Home from '../views/Home.vue'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Create a loading state
let isLoading = true
let isAuthenticated = false

// Create a promise to track initial auth state
const authReady = new Promise((resolve) => {
  onAuthStateChanged(auth, (user) => {
    isAuthenticated = !!user
    isLoading = false
    resolve(true)
  })
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: '/sell',
      name: 'sell',
      component: () => import('../views/sell.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/akunTokoSisiPenjual',
      name: 'akunTokoSisiPenjual',
      component: () => import('../views/akunTokoSisiPenjual.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/BioDataToko',
      name: 'BioDataToko',
      component: () => import('../views/BioDataToko.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/editDetailProduk',
      name: 'editDetailProduk',
      component: () => import('../views/editDetailProduk.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/landing',
      name: 'landing',
      component: () => import('../views/landing.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/signup.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/signin',
      name: 'signin',
      component: Signin,
      meta: { requiresGuest: true },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/Cart.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/akun',
      name: 'akun',
      component: () => import('../views/akun.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  // Wait for auth to be ready
  if (isLoading) {
    await authReady
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  // If the route requires auth and user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    next('/signin')
  }
  // If the route is for guests and user is authenticated
  else if (requiresGuest && isAuthenticated) {
    next('/')
  }
  // Otherwise proceed
  else {
    next()
  }
})

export default router
