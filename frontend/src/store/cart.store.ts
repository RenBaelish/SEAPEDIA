import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartDto, CartItemDto } from '@/types';

interface CartState {
  cart: CartDto | null;
  isOpen: boolean;

  setCart: (cart: CartDto) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  optimisticAddItem: (item: CartItemDto) => void;
  optimisticUpdateQuantity: (itemId: string, quantity: number) => void;
  optimisticRemoveItem: (itemId: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      isOpen: false,

      setCart: (cart) => set({ cart }),
      clearCart: () => set({ cart: null }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      optimisticAddItem: (item) =>
        set((state) => {
          if (!state.cart) return {};
          const existing = state.cart.items.find((i) => i.productId === item.productId);
          const items = existing
            ? state.cart.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            : [...state.cart.items, item];
          return {
            cart: {
              ...state.cart,
              items,
            },
          };
        }),

      optimisticUpdateQuantity: (itemId, quantity) =>
        set((state) => {
          if (!state.cart) return {};
          const items = state.cart.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          );
          return {
            cart: {
              ...state.cart,
              items,
            },
          };
        }),

      optimisticRemoveItem: (itemId) =>
        set((state) => {
          if (!state.cart) return {};
          const items = state.cart.items.filter((i) => i.id !== itemId);
          return {
            cart: {
              ...state.cart,
              items,
            },
          };
        }),
    }),
    {
      name: "seapedia-cart",
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
