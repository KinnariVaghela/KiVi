"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const data_source_1 = require("./data-source");
require("./passport");
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const cart_1 = __importDefault(require("./routes/cart"));
const orders_1 = __importDefault(require("./routes/orders"));
const profile_1 = __importDefault(require("./routes/profile"));
const admin_1 = __importDefault(require("./routes/admin"));
const errors_1 = require("./errors");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';
/**
 * Basic Security Headers
 * Protects against MIME-sniffing, clickjacking, and basic XSS.
 */
app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});
/**
 * Custom CORS Middleware
 * Dynamically allows localhost:4200 (Angular default) in development mode.
 * Crucially enables 'Access-Control-Allow-Credentials' to allow JWT cookies.
 */
app.use((req, res, next) => {
    const origin = req.headers.origin || '';
    const allowed = isDev
        ? [`http://localhost:4200`, `http://localhost:${PORT}`]
        : [`http://localhost:${PORT}`];
    if (allowed.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});
app.use(express_1.default.json({ limit: '2mb' }));
app.use((0, cookie_parser_1.default)());
/**
 * Static Asset Hosting
 * Serves product images and the compiled Angular production build.
 */
// app.use(
//   '/ProductImages',
//   express.static(path.join(__dirname, '../ProductImages')),
// );
app.use('/ProductImages', express_1.default.static(path_1.default.join(__dirname, '..', 'ProductImages')));
// const angularDist = path.join(__dirname, '../../kivi-frontend/dist/kivi-frontend/browser');
// app.use(express.static(angularDist));
app.use('/api/auth', auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/admin', admin_1.default);
/**
 * Global Error Handler
 * Specifically catches 'AppError' instances to send clean,
 * status-coded JSON to the client.
 */
app.use((err, _req, res, _next) => {
    if (err instanceof errors_1.AppError) {
        res.status(err.status).json({ error: err.message });
    }
    else {
        console.error('[Unhandled error]', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
const fs_1 = __importDefault(require("fs"));
// 1. Calculate the path clearly
const angularDistRoot = path_1.default.join(__dirname, "../../kivi-frontend/dist/kivi-frontend");
const angularBrowserPath = path_1.default.join(angularDistRoot, "browser");
// 2. Determine which path to use
const angularDistPath = fs_1.default.existsSync(angularBrowserPath)
    ? angularBrowserPath
    : angularDistRoot;
// 3. DEBUG: This is the most important part
console.log("Checking Angular path:", angularDistPath);
if (!fs_1.default.existsSync(angularDistPath)) {
    console.error("❌ ERROR: Angular build folder not found at the calculated path!");
}
app.use(express_1.default.static(angularDistPath));
app.get(/^\/(?!api).*/, (req, res) => {
    const indexPath = path_1.default.join(angularDistPath, "index.html");
    if (fs_1.default.existsSync(indexPath)) {
        res.sendFile(indexPath);
    }
    else {
        // This prevents the "silent exit" by sending an error to the browser instead
        res.status(404).send("index.html not found. Check your FRONT_END path logic.");
    }
});
/**
 * Database & Server Lifecycle
 * Initializes TypeORM connection before opening the network port.
 */
// AppDataSource.initialize()
//   .then(() => {
//     console.log('Database connected');
//     app.listen(PORT, () =>
//       console.log(`Server running → http://localhost:${PORT}`),
//     );
//   })
//   .catch((err) => {
//     console.error('Failed to connect to database:', err);
//     process.exit(1);
//   });
const startServer = async () => {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Database connected');
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server active at: http://localhost:${PORT}`);
        });
        // Catch port errors specifically
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use. Kill the other process or change the PORT in .env`);
            }
            else {
                console.error('❌ Server error:', err);
            }
            process.exit(1);
        });
    }
    catch (err) {
        console.error('🛑 Failed to initialize database:', err);
        process.exit(1);
    }
};
startServer();
