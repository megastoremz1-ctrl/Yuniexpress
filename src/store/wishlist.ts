import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistProduct {
  id: string;
  productId: string;
  title: string;
  image: string;
  priceMZN: number;
  originalPriceMZN?: number | null;
  rating: number;
}

interface WishlistState {
  items: WishlistProduct[];
  
  addItem: (product: WishlistProduct) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: WishlistProduct) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().isInWishlist(product.productId)) {
          set({ items: [...get().items, product] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.productId === productId);
      },

      toggleItem: (product) => {
        if (get().isInWishlist(product.productId)) {
          get().removeItem(product.productId);
        } else {
          get().addItem(product);
        }
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "yuniexpress-wishlist",
    }
  )
);
