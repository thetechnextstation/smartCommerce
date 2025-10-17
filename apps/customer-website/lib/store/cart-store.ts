import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  name: string
  slug: string
  price: number
  image: string
  quantity: number
  stock: number
  variant?: {
    id: string
    name: string
    options: Record<string, string>
  }
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string, variantId?: string) => void
  updateQuantity: (id: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void

  // Computed values
  itemCount: number
  subtotal: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      itemCount: 0,
      subtotal: 0,

      addItem: (newItem) => {
        const items = get().items
        const itemKey = newItem.variantId
          ? `${newItem.productId}-${newItem.variantId}`
          : newItem.productId

        const existingItemIndex = items.findIndex(item => {
          const existingKey = item.variantId
            ? `${item.productId}-${item.variantId}`
            : item.productId
          return existingKey === itemKey
        })

        if (existingItemIndex > -1) {
          // Item exists, increase quantity
          const updatedItems = [...items]
          const currentQuantity = updatedItems[existingItemIndex].quantity
          const maxQuantity = updatedItems[existingItemIndex].stock

          if (currentQuantity < maxQuantity) {
            updatedItems[existingItemIndex].quantity += 1
            set({
              items: updatedItems,
              itemCount: get().itemCount + 1,
              subtotal: get().subtotal + newItem.price
            })
          }
        } else {
          // New item, add to cart
          const itemToAdd: CartItem = {
            ...newItem,
            id: itemKey,
            quantity: 1
          }
          set({
            items: [...items, itemToAdd],
            itemCount: get().itemCount + 1,
            subtotal: get().subtotal + newItem.price
          })
        }

        // Open cart when item is added
        set({ isOpen: true })
      },

      removeItem: (productId, variantId) => {
        const items = get().items
        const itemKey = variantId ? `${productId}-${variantId}` : productId

        const itemToRemove = items.find(item => item.id === itemKey)
        if (!itemToRemove) return

        const updatedItems = items.filter(item => item.id !== itemKey)

        set({
          items: updatedItems,
          itemCount: get().itemCount - itemToRemove.quantity,
          subtotal: get().subtotal - (itemToRemove.price * itemToRemove.quantity)
        })
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }

        const items = get().items
        const itemKey = variantId ? `${productId}-${variantId}` : productId

        const itemIndex = items.findIndex(item => item.id === itemKey)
        if (itemIndex === -1) return

        const item = items[itemIndex]
        const quantityDiff = quantity - item.quantity

        // Check stock availability
        if (quantity > item.stock) {
          return
        }

        const updatedItems = [...items]
        updatedItems[itemIndex] = { ...item, quantity }

        set({
          items: updatedItems,
          itemCount: get().itemCount + quantityDiff,
          subtotal: get().subtotal + (item.price * quantityDiff)
        })
      },

      clearCart: () => {
        set({
          items: [],
          isOpen: false,
          itemCount: 0,
          subtotal: 0
        })
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen })
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        itemCount: state.itemCount,
        subtotal: state.subtotal
      })
    }
  )
)
