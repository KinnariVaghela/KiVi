"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const admin_controller_1 = require("../controller/admin.controller");
/**
 * Configure storage directory for product images.
 * Ensures the 'ProductImages' directory exists relative to the project root.
 */
const IMAGES_DIR = path_1.default.join(__dirname, '../../ProductImages');
if (!fs_1.default.existsSync(IMAGES_DIR))
    fs_1.default.mkdirSync(IMAGES_DIR, { recursive: true });
/**
 * Multer disk storage configuration.
 * Generates unique filenames using a timestamp and a random integer
 * to prevent naming collisions when multiple admins upload files.
 */
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    },
});
/**
 * Image upload middleware.
 * - Limits file size to 5MB.
 * - Restricts uploads to specific image formats (JPG, PNG, GIF, WEBP).
 */
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.jfif', '.png', '.gif', '.webp'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, allowed.includes(ext));
    },
});
const router = (0, express_1.Router)();
router.get('/products', auth_1.requireAdmin, admin_controller_1.adminGetAllProducts);
router.post('/products', auth_1.requireAdmin, upload.single('image'), admin_controller_1.adminCreateProduct);
router.patch('/products/:id', auth_1.requireAdmin, upload.single('image'), admin_controller_1.adminUpdateProduct);
router.delete('/products/:id', auth_1.requireAdmin, admin_controller_1.adminDeleteProduct);
router.post('/types', auth_1.requireAdmin, admin_controller_1.adminCreateType);
router.post('/categories', auth_1.requireAdmin, admin_controller_1.adminCreateCategory);
router.post('/subcategories', auth_1.requireAdmin, admin_controller_1.adminCreateSubCategory);
router.get('/customers', auth_1.requireAdmin, admin_controller_1.adminGetAllCustomers);
router.patch('/customers/:id/lock', auth_1.requireAdmin, admin_controller_1.adminToggleLockCustomer);
router.get('/orders', auth_1.requireAdmin, admin_controller_1.adminGetAllOrders);
router.get('/orders/:id', auth_1.requireAdmin, admin_controller_1.adminGetOrderById);
exports.default = router;
