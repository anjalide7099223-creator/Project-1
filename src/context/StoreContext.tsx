import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Category, CartItem, StoreSettings, Order } from '../types.ts';
import { api } from '../api.ts';

interface StoreContextType {
  settings: StoreSettings | null;
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  isAdmin: boolean;
  adminToken: string | null;
  loading: boolean;
  activeView: 'home' | 'shop' | 'admin';
  selectedCategory: string | null;
  searchQuery: string;
  isCartOpen: boolean;
  activeProductModal: Product | null;
  checkoutPayload: { isBuyNow: boolean; items: CartItem[] } | null;
  isAdminLoginOpen: boolean;
  
  // Actions
  setActiveView: (view: 'home' | 'shop' | 'admin') => void;
  setSelectedCategory: (cat: string | null) => void;
  setSearchQuery: (query: string) => void;
  setIsCartOpen: (open: boolean) => void;
  setActiveProductModal: (product: Product | null) => void;
  setIsAdminLoginOpen: (open: boolean) => void;
  
  // Cart Actions
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  initiateBuyNow: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  openCartCheckout: () => void;
  closeCheckout: () => void;
  
  // Admin & Refreshes
  loginAdmin: (token: string) => void;
  logoutAdmin: () => void;
  refreshAll: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'soe_cart_v1';
const ADMIN_TOKEN_KEY = 'soe_admin_token';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation & View state
  const [activeView, setActiveView] = useState<'home' | 'shop' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Modals
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [checkoutPayload, setCheckoutPayload] = useState<{ isBuyNow: boolean; items: CartItem[] } | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  
  // Admin auth
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  // Verify Admin Token on mount or change
  useEffect(() => {
    if (adminToken) {
      api.verifyToken(adminToken).then(valid => {
        setIsAdmin(valid);
        if (!valid) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          setAdminToken(null);
        }
      });
    } else {
      setIsAdmin(false);
    }
  }, [adminToken]);

  // Initial data load
  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const refreshProducts = async () => {
    try {
      // If admin, load all (including inactive), otherwise public only
      const data = await api.getProducts(isAdmin);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const refreshCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([refreshSettings(), refreshProducts(), refreshCategories()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, [isAdmin]);

  // Cart actions
  const addToCart = (
    product: Product,
    quantity = 1,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    const color = selectedColor || (product.colors?.[0]?.name ?? '');
    const size = selectedSize || (product.sizes?.[0] ?? '');
    const itemId = `${product.id}__${color}__${size}`;

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.id === itemId);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity,
        };
        return next;
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          quantity,
          selectedColor: color,
          selectedSize: size,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const initiateBuyNow = (
    product: Product,
    quantity = 1,
    selectedColor?: string,
    selectedSize?: string
  ) => {
    const color = selectedColor || (product.colors?.[0]?.name ?? '');
    const size = selectedSize || (product.sizes?.[0] ?? '');
    const singleItem: CartItem = {
      id: `${product.id}__${color}__${size}`,
      product,
      quantity,
      selectedColor: color,
      selectedSize: size,
    };
    setCheckoutPayload({
      isBuyNow: true,
      items: [singleItem],
    });
  };

  const openCartCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setCheckoutPayload({
      isBuyNow: false,
      items: [...cart],
    });
  };

  const closeCheckout = () => {
    setCheckoutPayload(null);
  };

  const loginAdmin = (token: string) => {
    setAdminToken(token);
    setIsAdmin(true);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    setIsAdminLoginOpen(false);
  };

  const logoutAdmin = () => {
    if (adminToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      }).catch(() => {});
    }
    setAdminToken(null);
    setIsAdmin(false);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    if (activeView === 'admin') {
      setActiveView('home');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        products,
        categories,
        cart,
        isAdmin,
        adminToken,
        loading,
        activeView,
        selectedCategory,
        searchQuery,
        isCartOpen,
        activeProductModal,
        checkoutPayload,
        isAdminLoginOpen,
        setActiveView,
        setSelectedCategory,
        setSearchQuery,
        setIsCartOpen,
        setActiveProductModal,
        setIsAdminLoginOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        initiateBuyNow,
        openCartCheckout,
        closeCheckout,
        loginAdmin,
        logoutAdmin,
        refreshAll,
        refreshProducts,
        refreshSettings,
        refreshCategories,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
