import { ref, computed } from 'vue'
import { collection, doc, addDoc, deleteDoc, onSnapshot, query, orderBy, updateDoc, writeBatch } from 'firebase/firestore'
import { db, auth } from '../firebase'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  sellerId: string
}

// Create reactive state
const cartItems = ref<CartItem[]>([])
const loading = ref(false)
const error = ref('')

// Computed properties
const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

const cartCount = computed(() => {
  return cartItems.value.reduce((count, item) => count + item.quantity, 0)
})

// Methods
const fetchCartItems = async () => {
  if (!auth.currentUser) return

  loading.value = true
  error.value = ''

  try {
    const cartRef = collection(db, 'users', auth.currentUser.uid, 'cart')
    const q = query(cartRef, orderBy('createdAt', 'desc'))

    onSnapshot(q, (snapshot) => {
      cartItems.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CartItem))
    })
  } catch (err) {
    console.error('Error fetching cart items:', err)
    error.value = 'Gagal memuat keranjang'
  } finally {
    loading.value = false
  }
}

const addToCart = async (product: { id: string; name: string; price: number; images: string[]; sellerId: string }) => {
  if (!auth.currentUser) {
    error.value = 'Silakan login terlebih dahulu'
    return
  }

  try {
    const cartRef = collection(db, 'users', auth.currentUser.uid, 'cart')

    // Check if product already exists in cart
    const existingItem = cartItems.value.find(item => item.productId === product.id)

    if (existingItem) {
      // Update quantity if item exists
      await updateQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      // Add new item if it doesn't exist
      await addDoc(cartRef, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/placeholder.png',
        quantity: 1,
        sellerId: product.sellerId,
        createdAt: new Date()
      })
    }
  } catch (err) {
    console.error('Error adding to cart:', err)
    error.value = 'Gagal menambahkan ke keranjang'
  }
}

const removeFromCart = async (itemId: string) => {
  if (!auth.currentUser) return

  try {
    const cartItemRef = doc(db, 'users', auth.currentUser.uid, 'cart', itemId)
    await deleteDoc(cartItemRef)
  } catch (err) {
    console.error('Error removing from cart:', err)
    error.value = 'Gagal menghapus dari keranjang'
  }
}

const updateQuantity = async (itemId: string, quantity: number) => {
  if (!auth.currentUser) return

  try {
    const cartItemRef = doc(db, 'users', auth.currentUser.uid, 'cart', itemId)
    await updateDoc(cartItemRef, { quantity })
  } catch (err) {
    console.error('Error updating quantity:', err)
    error.value = 'Gagal mengubah jumlah'
  }
}

const clearCart = async () => {
  if (!auth.currentUser) return

  try {
    const batch = writeBatch(db)
    cartItems.value.forEach(item => {
      const cartItemRef = doc(db, 'users', auth.currentUser!.uid, 'cart', item.id)
      batch.delete(cartItemRef)
    })
    await batch.commit()
  } catch (err) {
    console.error('Error clearing cart:', err)
    error.value = 'Gagal mengosongkan keranjang'
  }
}

// Export the cart store
export const useCartStore = () => {
  return {
    cartItems,
    loading,
    error,
    cartTotal,
    cartCount,
    fetchCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
}
