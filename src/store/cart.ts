import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartProduct {
  id: string;
  productId: string;
  title: string;
  image: string;
  priceMZN: number;
  originalPriceMZN?: number | null;
  quantity: number;
  variant?: string;
  stock: number;
}

interface CartState {
  items: CartProduct[];
  isOpen: boolean;
  
  // Actions
  addItem: (product: CartProduct) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  
  // Computed
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (item) => item.productId === product.productId && item.variant === product.variant
        );

        if (existingIndex > -1) {
          const updated = [...items];
          updated[existingIndex].quantity += product.quantity;
          set({ items: updated });
        } else {
          set({ items: [...items, product] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const items = get().items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        set({ items });
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      setCartOpen: (open) => set({ isOpen: open }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.priceMZN * item.quantity, 0),
    }),
    {
      name: "yuniexpress-cart",
    }
  )
);
