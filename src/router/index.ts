import { createRouter, createWebHistory } from 'vue-router'
import landing from '../views/landing.vue'
import Signin from '../views/signin.vue'
import Home from '../views/Home.vue'
import sell from '../views/sell.vue'
import editDetailProduk from '../views/editDetailProduk.vue'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

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
  ],
})

let isAuthReady = false

onAuthStateChanged(auth, () => {
  isAuthReady = true
})

router.beforeEach(async (to, from, next) => {
  // Wait for auth to be ready
  if (!isAuthReady) {
    await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, () => {
        unsubscribe()
        resolve(true)
      })
    })
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)
  const isAuthenticated = auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    next('/signin')
  } else if (requiresGuest && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
