import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Sell from '../views/sell.vue'
import signup from '../views/signup.vue'
import Signin from '../views/signin.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/About.vue'),
    },
    {
      path: '/sell',
      name: 'sell',
      component: () => import('../views/sell.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/signup.vue'),
    },
    {
      path: '/signin',
      name: 'signin',
      component: () => import('../views/signin.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/Cart.vue'),
    },
  ],
})

export default router
