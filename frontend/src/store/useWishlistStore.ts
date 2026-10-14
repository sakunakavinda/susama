import { create } from 'zustand';

export interface WishlistItem {
  id: string;
  name: string;
  slug?: string;
  price: number; // In LKR
  originalPrice?: number | null;
  image: string;
  categoryName?: string;
  tag?: string;
  rating?: number;
  reviews?: number;
  short_description?: string;
  ingredients?: string;
  how_to_use?: string;
}

interface WishlistState {
  items: WishlistItem[];
  
  // Actions
  addItem: (product: {
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
    tag?: string;
    rating?: number;
    reviews?: number;
    short_description?: string;
    ingredients?: string;
    how_to_use?: string;
  }) => void;
  
  removeItem: (id: string) => void;
  toggleWishlist: (product: {
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
    tag?: string;
    rating?: number;
    reviews?: number;
    short_description?: string;
    ingredients?: string;
    how_to_use?: string;
  }) => boolean; // returns true if added, false if removed
  
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

const STORAGE_KEY = 'susama_wishlist';

const getInitialWishlist = (): WishlistItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (items: WishlistItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save wishlist to localStorage:', err);
  }
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: getInitialWishlist(),

  addItem: (product) => {
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
      const exists = state.items.some((item) => item.id === product.id);
      if (exists) return state; // Already in wishlist

      const newItem: WishlistItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: effectivePrice,
        originalPrice,
        image,
        categoryName: product.category_name,
        tag: product.tag,
        rating: product.rating,
        reviews: product.reviews,
        short_description: product.short_description,
        ingredients: product.ingredients,
        how_to_use: product.how_to_use
      };

      const updated = [newItem, ...state.items];
      saveWishlist(updated);
      return { items: updated };
    });
  },

  removeItem: (id) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      saveWishlist(updated);
      return { items: updated };
    });
  },

  toggleWishlist: (product) => {
    const exists = get().items.some((item) => item.id === product.id);
    if (exists) {
      get().removeItem(product.id);
      return false; // Removed
    } else {
      get().addItem(product);
      return true; // Added
    }
  },

  isInWishlist: (id) => {
    return get().items.some((item) => item.id === id);
  },

  clearWishlist: () => {
    saveWishlist([]);
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.length;
  }
}));
