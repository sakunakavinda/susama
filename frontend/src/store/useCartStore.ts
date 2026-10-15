import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  slug?: string;
  price: number; // In LKR
  originalPrice?: number | null;
  image: string;
  quantity: number;
  categoryName?: string;
}

export interface ShippingSettings {
  freeShippingThreshold: number; // In LKR
  standardShippingFee: number;   // In LKR
  currency: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  shippingSettings: ShippingSettings;
  isLoadingSettings: boolean;

  // Drawer controls
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Cart operations
  addItem: (
    product: {
      id: string;
      name: string;
      slug?: string;
      price?: string | number;
      base_price?: number | string;
      sale_price?: number | string | null;
      primary_image?: string;
      image_url?: string;
      image?: string;
      category_name?: string;
    },
    quantity?: number
  ) => void;

  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  fetchShippingSettings: () => Promise<void>;

  // Calculations
  getTotalItems: () => number;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getGrandTotal: () => number;
  getFreeShippingProgress: () => {
    isFree: boolean;
    remaining: number;
    percentage: number;
  };
}

const STORAGE_KEY = 'susama_cart';
const API_BASE = 'http://localhost:5001/api/settings/shipping';

const getInitialCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: getInitialCart(),
  isOpen: false,
  shippingSettings: {
    freeShippingThreshold: 7500, // Default 7,500 LKR
    standardShippingFee: 450,    // Default 450 LKR
    currency: 'LKR'
  },
  isLoadingSettings: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  fetchShippingSettings: async () => {
    set({ isLoadingSettings: true });
    try {
      const res = await fetch(API_BASE);
      const json = await res.json();
      if (json.success && json.data) {
        set({
          shippingSettings: {
            freeShippingThreshold: Number(json.data.free_shipping_threshold) || 7500,
            standardShippingFee: Number(json.data.standard_shipping_fee) || 450,
            currency: json.data.currency || 'LKR'
          },
          isLoadingSettings: false
        });
      }
    } catch {
      set({ isLoadingSettings: false });
    }
  },

  addItem: (product, quantity = 1) => {
    // Guard: Do not add items that are out of stock (0 stock or is_in_stock is false)
    if (
      ((product as any).stock_quantity !== undefined && Number((product as any).stock_quantity) <= 0) ||
      (product as any).is_in_stock === false
    ) {
      return;
    }

    let effectivePrice = 0;
    let originalPrice: number | null = null;

    if (product.sale_price !== undefined && product.sale_price !== null && product.sale_price !== '') {
      effectivePrice = Number(product.sale_price);
      if (product.base_price) originalPrice = Number(product.base_price);
    } else if (product.base_price !== undefined && product.base_price !== null && product.base_price !== '') {
      effectivePrice = Number(product.base_price);
    } else if (product.price) {
      effectivePrice = Number(String(product.price).replace(/[^0-9.]/g, '')) || 0;
    }

    const image = product.primary_image || product.image_url || product.image || '/images/hero/hero-product.png';

    set((state) => {
      const existingIndex = state.items.findIndex((item) => item.id === product.id);
      let updatedItems: CartItem[];

      if (existingIndex > -1) {
        updatedItems = state.items.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: effectivePrice,
          originalPrice,
          image,
          quantity,
          categoryName: product.category_name
        };
        updatedItems = [...state.items, newItem];
      }

      saveCart(updatedItems);
      return { items: updatedItems, isOpen: true }; // Automatically open cart drawer for instant feedback
    });
  },

  updateQuantity: (id, quantity) => {
    set((state) => {
      let updatedItems: CartItem[];
      if (quantity <= 0) {
        updatedItems = state.items.filter((item) => item.id !== id);
      } else {
        updatedItems = state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
      }
      saveCart(updatedItems);
      return { items: updatedItems };
    });
  },

  removeItem: (id) => {
    set((state) => {
      const updatedItems = state.items.filter((item) => item.id !== id);
      saveCart(updatedItems);
      return { items: updatedItems };
    });
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getShippingFee: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    const threshold = get().shippingSettings.freeShippingThreshold;
    return subtotal >= threshold ? 0 : get().shippingSettings.standardShippingFee;
  },

  getGrandTotal: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal + get().getShippingFee();
  },

  getFreeShippingProgress: () => {
    const subtotal = get().getSubtotal();
    const threshold = get().shippingSettings.freeShippingThreshold;
    const remaining = Math.max(0, threshold - subtotal);
    const percentage = threshold > 0 ? Math.min(100, Math.round((subtotal / threshold) * 100)) : 100;
    return {
      isFree: subtotal >= threshold && subtotal > 0,
      remaining,
      percentage
    };
  }
}));
