export interface ProductColor {
  name: string;
  hex?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  stock: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

export interface CartItem {
  id: string; // unique composite key (productId-color-size)
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  imageUrl?: string;
  color?: string;
  size?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp: string;
  deliveryAddress: string;
  city: string;
  state: string;
  pinCode: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  whatsappUrl: string;
  status: 'Pending' | 'Contacted' | 'Confirmed' | 'Shipped' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl: string;
  bannerUrl: string;
  whatsappNumber: string;
  currency: string;
  email: string;
  phone: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  heroHeading: string;
  heroSubheading: string;
  heroButtonText: string;
  aboutHeading: string;
  aboutStory: string;
  announcementBarText: string;
  showAnnouncement: boolean;
}
