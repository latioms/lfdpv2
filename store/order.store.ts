import { create } from 'zustand'
import { CustomerRecord as Customer } from '@/services/types'

interface OrderItem {
  id: string
  quantity: number
  price: number
  name: string
}

interface OrderState {
  items: OrderItem[]
  customer: Customer | null
  isSearchOpen: boolean
  isCustomerDialogOpen: boolean
  searchQuery: string
  addItem: (item: Omit<OrderItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  setCustomer: (customer: Customer | null) => void
  toggleSearch: () => void
  toggleCustomerDialog: () => void
  setSearchQuery: (query: string) => void
  clearOrder: () => void
  closeCustomerDialog: () => void
  openCustomerDialog: () => void
}

export const useOrderStore = create<OrderState>((set) => ({
  items: [],
  customer: null,
  isSearchOpen: false,
  isCustomerDialogOpen: false,
  searchQuery: '',

  addItem: (item) => set((state) => {
    const existingItem = state.items.find((i) => i.id === item.id)
    if (existingItem) {
      return {
        items: state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      }
    }
    return { items: [...state.items, { ...item, quantity: 1 }] }
  }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    })),

  setCustomer: (customer) => set({ customer }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  toggleCustomerDialog: () => set((state) => ({ isCustomerDialogOpen: !state.isCustomerDialogOpen })),
  closeCustomerDialog: () => set({ isCustomerDialogOpen: false }),
  openCustomerDialog: () => set({ isCustomerDialogOpen: true }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  clearOrder: () => set({ 
    items: [], 
    customer: null, 
    searchQuery: '',
    isCustomerDialogOpen: false,
    isSearchOpen: false 
  }),
})) 