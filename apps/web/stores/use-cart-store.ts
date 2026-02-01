import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    skuId: string;
    quantity: number;
    // Add more fields as needed (e.g., dish info for optimistic UI)
    dishName?: string;
    price?: number;
    image?: string;
    variantOptions?: string[];
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (skuId: string) => void;
    updateQuantity: (skuId: string, quantity: number) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            addItem: (newItem) =>
                set((state) => {
                    const existingItem = state.items.find(
                        (i) => i.skuId === newItem.skuId,
                    );
                    if (existingItem) {
                        return {
                            items: state.items.map((i) =>
                                i.skuId === newItem.skuId
                                    ? {
                                          ...i,
                                          quantity:
                                              i.quantity + newItem.quantity,
                                      }
                                    : i,
                            ),
                        };
                    }
                    return { items: [...state.items, newItem] };
                }),
            removeItem: (skuId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.skuId !== skuId),
                })),
            updateQuantity: (skuId, quantity) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.skuId === skuId ? { ...i, quantity } : i,
                    ),
                })),
            clearCart: () => set({ items: [] }),
        }),
        {
            name: 'cart-storage', // key in localStorage
        },
    ),
);
