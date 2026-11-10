import fs from 'fs';
import path from 'path';
import { Product, Category, Order, StoreSettings } from '../types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

// Ensure essential folders exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  settings: StoreSettings;
  adminPassword: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Stitches of Elegance',
  tagline: 'Handmade with Love',
  logoUrl: '/assets/aistudio/Screenshot_2026-11-10-13-12-47-886_com.instagram.android_8f254217.jpg',
  bannerUrl: '',
  whatsappNumber: '919876543210',
  currency: '₹',
  email: 'contact@stitcheselegance.com',
  phone: '+91 98765 43210',
  address: 'Artisan Boutique Studio, India',
  instagramUrl: 'https://instagram.com',
  facebookUrl: '',
  deliveryCharge: 60,
  freeDeliveryThreshold: 999,
  heroHeading: 'Handcrafted Elegance, Sewn with Love',
  heroSubheading: 'Exquisite tailored creations and artisanal bespoke pieces crafted with graceful silhouettes and timeless attention to detail.',
  heroButtonText: 'Explore Collection',
  aboutHeading: 'Our Craftsmanship & Heritage',
  aboutStory: 'Welcome to Stitches of Elegance. Every garment we create is an ode to refined tailoring, premium handpicked textiles, and mindful artisan craftsmanship. From bespoke embroideries to everyday luxury, we weave beauty into every stitch.',
  announcementBarText: '✨ Handcrafted with love · Order easily on WhatsApp · Free delivery on orders over ₹999',
  showAnnouncement: true,
};

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial: DatabaseSchema = {
        products: [], // ABSOLUTELY EMPTY CATALOGUE
        categories: [], // EMPTY CATEGORIES
        orders: [],
        settings: DEFAULT_SETTINGS,
        adminPassword: 'admin',
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      adminPassword: parsed.adminPassword || 'admin',
    };
  } catch (error) {
    console.error('Error reading database file:', error);
    return {
      products: [],
      categories: [],
      orders: [],
      settings: DEFAULT_SETTINGS,
      adminPassword: 'admin',
    };
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (error) {
    console.error('Error writing to database:', error);
    throw error;
  }
}

export const db = {
  // Products
  getProducts(publicOnly = true): Product[] {
    const data = readDb();
    if (publicOnly) {
      return data.products.filter(p => p.isActive);
    }
    return data.products;
  },

  getProductById(id: string): Product | undefined {
    const data = readDb();
    return data.products.find(p => p.id === id);
  },

  createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const data = readDb();
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: now,
      updatedAt: now,
    };
    data.products.unshift(newProduct);
    writeDb(data);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<Product>): Product {
    const data = readDb();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }
    const updated = {
      ...data.products[index],
      ...updates,
      id, // protect id
      updatedAt: new Date().toISOString(),
    };
    data.products[index] = updated;
    writeDb(data);
    return updated;
  },

  deleteProduct(id: string): boolean {
    const data = readDb();
    const initialLen = data.products.length;
    data.products = data.products.filter(p => p.id !== id);
    if (data.products.length !== initialLen) {
      writeDb(data);
      return true;
    }
    return false;
  },

  // Categories
  getCategories(): Category[] {
    const data = readDb();
    return data.categories;
  },

  createCategory(cat: { name: string; slug?: string; imageUrl?: string }): Category {
    const data = readDb();
    const newCategory: Category = {
      ...cat,
      id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    };
    data.categories.push(newCategory);
    writeDb(data);
    return newCategory;
  },

  deleteCategory(id: string): boolean {
    const data = readDb();
    const initialLen = data.categories.length;
    data.categories = data.categories.filter(c => c.id !== id);
    if (data.categories.length !== initialLen) {
      writeDb(data);
      return true;
    }
    return false;
  },

  // Orders
  getOrders(): Order[] {
    const data = readDb();
    return data.orders;
  },

  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
    const data = readDb();
    const newOrder: Order = {
      ...orderData,
      id: 'ORD-' + Date.now().toString().slice(-6),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    data.orders.unshift(newOrder);
    writeDb(data);
    return newOrder;
  },

  updateOrderStatus(id: string, status: Order['status']): Order {
    const data = readDb();
    const order = data.orders.find(o => o.id === id);
    if (!order) {
      throw new Error('Order not found');
    }
    order.status = status;
    writeDb(data);
    return order;
  },

  // Settings
  getSettings(): StoreSettings {
    const data = readDb();
    return data.settings;
  },

  updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    const data = readDb();
    data.settings = {
      ...data.settings,
      ...updates,
    };
    writeDb(data);
    return data.settings;
  },

  // Admin auth
  getAdminPassword(): string {
    const data = readDb();
    return data.adminPassword;
  },

  verifyAdmin(password: string): boolean {
    const data = readDb();
    return data.adminPassword === password;
  },

  updateAdminPassword(currentPass: string, newPass: string): boolean {
    const data = readDb();
    if (data.adminPassword !== currentPass) {
      return false;
    }
    data.adminPassword = newPass;
    writeDb(data);
    return true;
  },
};
