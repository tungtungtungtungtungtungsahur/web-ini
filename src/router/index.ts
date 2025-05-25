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
    console.log('onAuthStateChanged: user', user ? user.uid : 'null', 'isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
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
      path: '/ktp',
      name: 'ktp',
      component: () => import('../views/ktp.vue'),
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
      path: '/editDetailProduk/:productId',
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
    {
      path: '/bantuan',
      name: 'bantuan',
      component: () => import('../views/bantuan.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/editProfile',
      name: 'editProfile',
      component: () => import('../views/editProfile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/cart-done',
      name: 'CartDone',
      component:() => import('../views/CartDone.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchResults.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('../views/productDetail.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  console.log('beforeEach called for', to.path);
  console.log('  isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    console.log('  Waiting for authReady...');
    await authReady
    console.log('  authReady resolved. isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  console.log('  requiresAuth:', requiresAuth, 'requiresGuest:', requiresGuest);

  // If the route requires auth and user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    console.log('  Requires auth but not authenticated, redirecting to /signin');
    next('/signin')
  }
  // If the route is for guests and user is authenticated
  else if (requiresGuest && isAuthenticated) {
    console.log('  Requires guest but authenticated, redirecting to /');
    next('/')
  }

  else {
    console.log('  Proceeding with navigation.');
    next()
  }
})

export default router
