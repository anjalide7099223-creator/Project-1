import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from './src/server/db.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure uploads folder in public
const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Persistent token configuration
const SESSION_SALT = 'soe_boutique_secure_token_salt_2026';
const revokedTokens = new Set<string>();

function generateSessionToken(password: string): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SESSION_SALT + password)
    .update(timestamp)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

function isValidSessionToken(token: string): boolean {
  if (!token || !token.includes('.') || revokedTokens.has(token)) return false;
  const [timestamp, signature] = token.split('.');
  const currentPassword = db.getAdminPassword();
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SALT + currentPassword)
    .update(timestamp)
    .digest('hex');
  if (signature !== expectedSig) return false;
  // Valid for 30 days
  const age = Date.now() - Number(timestamp);
  return age >= 0 && age < 30 * 24 * 60 * 60 * 1000;
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const unique = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `${cleanName}_${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Middleware
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static public assets
app.use(express.static(path.resolve(process.cwd(), 'public')));
app.use('/uploads', express.static(uploadsDir));

// Auth check middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }
  const token = authHeader.split(' ')[1];
  if (!isValidSessionToken(token)) {
    res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
    return;
  }
  next();
};

// ================= API ROUTES =================

// Auth routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Password is required' });
    return;
  }
  if (db.verifyAdmin(password)) {
    const token = generateSessionToken(password);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (isValidSessionToken(token)) {
      res.json({ authenticated: true });
      return;
    }
  }
  res.json({ authenticated: false });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    revokedTokens.add(token);
  }
  res.json({ success: true });
});

app.post('/api/auth/change-password', requireAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Both current and new passwords are required' });
    return;
  }
  if (newPassword.length < 4) {
    res.status(400).json({ error: 'New password must be at least 4 characters long' });
    return;
  }
  const success = db.updateAdminPassword(currentPassword, newPassword);
  if (success) {
    res.json({ success: true, message: 'Password updated successfully' });
  } else {
    res.status(400).json({ error: 'Incorrect current password' });
  }
});

// Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json(settings);
});

app.put('/api/settings', requireAuth, (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update settings' });
  }
});

// Image Upload Endpoint
app.post('/api/upload', requireAuth, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded or invalid file type' });
    return;
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url, filename: req.file.filename });
});

// Products
app.get('/api/products', (req: Request, res: Response) => {
  const showAll = req.query.all === 'true';
  const products = db.getProducts(!showAll);
  res.json(products);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

app.post('/api/products', requireAuth, (req: Request, res: Response) => {
  try {
    const { name, description, price, discountPrice, category, stock, images, colors, sizes, isFeatured, isActive } = req.body;
    if (!name || price === undefined) {
      res.status(400).json({ error: 'Product name and price are required' });
      return;
    }
    const product = db.createProduct({
      name,
      description: description || '',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      category: category || 'General',
      stock: stock !== undefined ? Number(stock) : 10,
      images: Array.isArray(images) ? images : [],
      colors: Array.isArray(colors) ? colors : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      isFeatured: Boolean(isFeatured),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });
    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

app.put('/api/products/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(err.message === 'Product not found' ? 404 : 500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Categories
app.get('/api/categories', (_req: Request, res: Response) => {
  const categories = db.getCategories();
  res.json(categories);
});

app.post('/api/categories', requireAuth, (req: Request, res: Response) => {
  try {
    const { name, imageUrl } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }
    const newCat = db.createCategory({ name: name.trim(), imageUrl });
    res.status(201).json(newCat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', requireAuth, (req: Request, res: Response) => {
  const success = db.deleteCategory(req.params.id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

// Orders
app.get('/api/orders', requireAuth, (_req: Request, res: Response) => {
  const orders = db.getOrders();
  res.json(orders);
});

app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone, customerWhatsApp, deliveryAddress, city, state, pinCode, notes, items, subtotal, deliveryCharge, total, whatsappUrl } = req.body;
    if (!customerName || !customerPhone || !deliveryAddress || !items || !items.length) {
      res.status(400).json({ error: 'Missing required order details' });
      return;
    }
    const order = db.createOrder({
      customerName,
      customerPhone,
      customerWhatsApp: customerWhatsApp || customerPhone,
      deliveryAddress,
      city: city || '',
      state: state || '',
      pinCode: pinCode || '',
      notes: notes || '',
      items,
      subtotal: Number(subtotal),
      deliveryCharge: Number(deliveryCharge),
      total: Number(total),
      whatsappUrl: whatsappUrl || '',
    });
    res.status(201).json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', requireAuth, (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = db.updateOrderStatus(req.params.id, status);
    res.json(updated);
  } catch (err: any) {
    res.status(err.message === 'Order not found' ? 404 : 500).json({ error: err.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
