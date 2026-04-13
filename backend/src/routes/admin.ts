import { Router }        from 'express';
import path              from 'path';
import fs                from 'fs';
import multer            from 'multer';
import { requireAdmin }  from '../middleware/auth';
import {
  adminGetAllProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminCreateType, adminCreateCategory, adminCreateSubCategory,
  adminGetAllCustomers, adminToggleLockCustomer,
  adminGetAllOrders, adminGetOrderById,
} from '../controller/admin.controller';

/**
 * Configure storage directory for product images.
 * Ensures the 'ProductImages' directory exists relative to the project root.
 */
const IMAGES_DIR = path.join(__dirname, '../../ProductImages');
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

/**
 * Multer disk storage configuration.
 * Generates unique filenames using a timestamp and a random integer 
 * to prevent naming collisions when multiple admins upload files.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
  filename:    (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

/**
 * Image upload middleware.
 * - Limits file size to 5MB.
 * - Restricts uploads to specific image formats (JPG, PNG, GIF, WEBP).
 */
const upload = multer({
  storage,
  limits:     { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.jfif', '.png', '.gif', '.webp'];
    const ext     = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const router = Router();

router.get   ('/products',     requireAdmin, adminGetAllProducts);
router.post  ('/products',     requireAdmin, upload.single('image'), adminCreateProduct);
router.patch ('/products/:id', requireAdmin, upload.single('image'), adminUpdateProduct);
router.delete('/products/:id', requireAdmin, adminDeleteProduct);

router.post('/types',          requireAdmin, adminCreateType);
router.post('/categories',     requireAdmin, adminCreateCategory);
router.post('/subcategories',  requireAdmin, adminCreateSubCategory);

router.get  ('/customers',          requireAdmin, adminGetAllCustomers);
router.patch('/customers/:id/lock', requireAdmin, adminToggleLockCustomer);

router.get('/orders',     requireAdmin, adminGetAllOrders);
router.get('/orders/:id', requireAdmin, adminGetOrderById);

export default router;