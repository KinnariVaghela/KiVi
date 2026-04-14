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
const data_source_1 = require("./data-source");
const User_1 = require("./entity/User");
const ProductType_1 = require("./entity/ProductType");
const Category_1 = require("./entity/Category");
const SubCategory_1 = require("./entity/SubCategory");
const Product_1 = require("./entity/Product");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function seed() {
    await data_source_1.AppDataSource.initialize();
    console.log('Connected. Seeding...');
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const adminExists = await userRepo.findOneBy({ email: 'admin@shop.com' });
    if (!adminExists) {
        await userRepo.save(userRepo.create({
            name: 'Admin',
            email: 'admin@shop.com',
            passwordHash: await bcrypt_1.default.hash('admin123', 12),
            role: User_1.UserRole.ADMIN,
            phone: '000-000-0000',
            address: 'Admin Headquarters',
            isLocked: false,
        }));
        console.log('Admin created: admin@shop.com / admin123');
    }
    const customerEmail = 'kinnarivaghela@example.com';
    const customerExists = await userRepo.findOneBy({ email: customerEmail });
    if (!customerExists) {
        await userRepo.save(userRepo.create({
            name: 'Kinnari Vaghela',
            email: customerEmail,
            passwordHash: await bcrypt_1.default.hash('customer123', 12),
            role: User_1.UserRole.CUSTOMER,
            phone: '9876543210',
            address: 'One Luxuria, Apartment 1001, Mumbai, MH',
            isLocked: false,
        }));
        console.log(`Customer created: ${customerEmail} / customer123`);
    }
    const typeRepo = data_source_1.AppDataSource.getRepository(ProductType_1.ProductType);
    const catRepo = data_source_1.AppDataSource.getRepository(Category_1.Category);
    const subRepo = data_source_1.AppDataSource.getRepository(SubCategory_1.SubCategory);
    const prodRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
    const taxonomyData = [
        {
            type: 'Electronics',
            categories: [
                {
                    name: 'Computer Peripherals',
                    subs: [
                        { name: 'Keyboards', products: [
                                { name: 'Anker Multimedia Keyboard', description: 'Full-size wireless keyboard with multimedia keys.', price: 2499, stock: 50 },
                                { name: 'Mechanical Gaming Keyboard', description: 'RGB backlit mechanical keyboard with blue switches.', price: 6599, stock: 30 },
                            ] },
                        { name: 'Mice', products: [
                                { name: 'Logitech Wireless Mouse', description: 'Ergonomic wireless mouse with long battery life.', price: 1299, stock: 45 },
                                { name: 'Gaming Mouse 12000 DPI', description: 'High-precision gaming mouse with adjustable DPI.', price: 3999, stock: 20 },
                            ] },
                    ],
                },
                {
                    name: 'Audio',
                    subs: [
                        { name: 'Headphones', products: [
                                { name: 'Sony WH-1000XM5', description: 'Industry-leading noise cancelling headphones.', price: 29990, stock: 15 },
                                { name: 'Budget Over-Ear Headphones', description: 'Comfortable stereo headphones for everyday use.', price: 1499, stock: 60 },
                            ] },
                        { name: 'Bluetooth Speakers', products: [
                                { name: 'JBL Flip 6', description: 'Powerful sound and deep bass, IP67 waterproof.', price: 11999, stock: 25 },
                            ] },
                    ],
                },
                {
                    name: 'Storage',
                    subs: [
                        { name: 'External Drives', products: [
                                { name: '1TB Portable SSD', description: 'Ultra-fast data transfer in a compact design.', price: 8499, stock: 40 },
                            ] },
                    ],
                },
            ],
        },
        {
            type: 'Furniture',
            categories: [
                {
                    name: 'Living Room',
                    subs: [
                        { name: 'Tables', products: [
                                { name: 'Wooden Coffee Table', description: 'Solid oak coffee table, minimalist design.', price: 15499, stock: 8 },
                                { name: 'Glass Side Table', description: 'Tempered glass side table with chrome legs.', price: 6999, stock: 12 },
                            ] },
                        { name: 'Sofas', products: [
                                { name: 'Three-Seater Fabric Sofa', description: 'Comfortable grey fabric sofa, modern style.', price: 45999, stock: 5 },
                            ] },
                    ],
                },
                {
                    name: 'Office',
                    subs: [
                        { name: 'Desks', products: [
                                { name: 'Standing Desk 140cm', description: 'Electric height-adjustable standing desk.', price: 36999, stock: 10 },
                                { name: 'Computer Desk', description: 'Compact wooden computer desk with cable management.', price: 9499, stock: 18 },
                            ] },
                        { name: 'Chairs', products: [
                                { name: 'Ergonomic Mesh Chair', description: 'High-back chair with lumbar support and adjustable headrest.', price: 12499, stock: 15 },
                            ] },
                    ],
                },
            ],
        },
        {
            type: 'Kitchen & Dining',
            categories: [
                {
                    name: 'Appliances',
                    subs: [
                        { name: 'Coffee Makers', products: [
                                { name: 'Drip Coffee Machine', description: '1.5L capacity with keep-warm function.', price: 3299, stock: 20 },
                                { name: 'Espresso Maker', description: '15-bar pressure pump for professional espresso at home.', price: 14999, stock: 10 },
                            ] },
                        { name: 'Mixers & Grinders', products: [
                                { name: '750W Mixer Grinder', description: 'Heavy-duty motor with 3 stainless steel jars.', price: 4899, stock: 35 },
                            ] },
                    ],
                },
                {
                    name: 'Cookware',
                    subs: [
                        { name: 'Pots & Pans', products: [
                                { name: 'Non-Stick Kadai', description: 'Deep frying pan with toughened glass lid.', price: 1899, stock: 50 },
                                { name: 'Cast Iron Skillet', description: 'Pre-seasoned 10-inch skillet for even heating.', price: 2499, stock: 20 },
                            ] },
                    ],
                },
            ],
        },
        {
            type: 'Sports & Fitness',
            categories: [
                {
                    name: 'Gym Equipment',
                    subs: [
                        { name: 'Weights', products: [
                                { name: 'Adjustable Dumbbell Set', description: '20kg set with high-quality iron plates.', price: 4999, stock: 15 },
                            ] },
                        { name: 'Yoga', products: [
                                { name: 'Anti-Tear Yoga Mat', description: '6mm thick high-density padding for comfort.', price: 999, stock: 100 },
                            ] },
                    ],
                },
            ],
        },
        {
            type: 'Stationery',
            categories: [
                {
                    name: 'Kids',
                    subs: [
                        { name: 'Textbooks', products: [
                                { name: 'Multiplication Table Book', description: 'Colourful multiplication table learning book for kids.', price: 199, stock: 100 },
                                { name: 'Science Activity Book Grade 5', description: 'Hands-on science activities for ages 10–11.', price: 229, stock: 75 },
                            ] },
                    ],
                },
                {
                    name: 'Writing',
                    subs: [
                        { name: 'Pens & Pencils', products: [
                                { name: 'Premium Ballpoint Pen Set', description: 'Set of 12 smooth-writing ballpoint pens.', price: 799, stock: 200 },
                                { name: 'Mechanical Pencils Pack', description: '0.5mm mechanical pencils, pack of 6.', price: 499, stock: 150 },
                            ] },
                        { name: 'Notebooks', products: [
                                { name: 'A5 Ruled Notebook', description: '200-page ruled notebook, hardcover.', price: 249, stock: 120 },
                                { name: 'Dot Grid Journal', description: 'Bullet journal with dot grid pages.', price: 899, stock: 80 },
                            ] },
                    ],
                },
            ],
        },
        {
            type: 'Fashion',
            categories: [
                {
                    name: 'Menswear',
                    subs: [
                        { name: 'Topwear', products: [
                                { name: 'Pima Cotton T-Shirt', description: 'Essential crew neck tee in premium pima cotton.', price: 999, stock: 150 },
                                { name: 'Slim-Fit Oxford Shirt', description: 'Classic white button-down shirt for formal or casual wear.', price: 1899, stock: 80 },
                                { name: 'Oversized Graphic Hoodie', description: 'Heavyweight fleece hoodie with minimalist back print.', price: 2499, stock: 45 },
                            ] },
                        { name: 'Bottomwear', products: [
                                { name: 'Straight-Fit Indigo Jeans', description: 'Raw denim jeans with reinforced stitching.', price: 3299, stock: 60 },
                                { name: 'Chino Trousers', description: 'Stretchable cotton chinos in olive green.', price: 2199, stock: 70 },
                            ] },
                    ],
                },
                {
                    name: 'Womenswear',
                    subs: [
                        { name: 'Ethnic Wear', products: [
                                { name: 'Embroidered Kurta Set', description: 'Elegant cotton kurta with palazzo pants and dupatta.', price: 3499, stock: 30 },
                                { name: 'Floral Print Saree', description: 'Lightweight chiffon saree with a modern floral border.', price: 2899, stock: 25 },
                            ] },
                        { name: 'Western Wear', products: [
                                { name: 'Midi Wrap Dress', description: 'Satin finish wrap dress in emerald green.', price: 2799, stock: 40 },
                                { name: 'High-Rise Mom Jeans', description: 'Classic 90s style light wash denim.', price: 2599, stock: 55 },
                            ] },
                    ],
                },
                {
                    name: 'Footwear',
                    subs: [
                        { name: 'Sneakers', products: [
                                { name: 'Classic White Trainers', description: 'Minimalist vegan leather sneakers.', price: 3999, stock: 100 },
                                { name: 'Performance Running Shoes', description: 'Breathable mesh upper with high-rebound cushioning.', price: 5499, stock: 40 },
                            ] },
                        { name: 'Formal', products: [
                                { name: 'Leather Oxford Shoes', description: 'Handcrafted genuine leather shoes in tan brown.', price: 4899, stock: 20 },
                            ] },
                    ],
                },
                {
                    name: 'Accessories',
                    subs: [
                        { name: 'Bags', products: [
                                { name: 'Canvas Tote Bag', description: 'Eco-friendly heavy-duty canvas bag with inner pocket.', price: 699, stock: 200 },
                                { name: 'Leather Crossbody Bag', description: 'Compact textured leather bag with adjustable strap.', price: 2199, stock: 35 },
                            ] },
                        { name: 'Watches', products: [
                                { name: 'Minimalist Analog Watch', description: 'Stainless steel mesh strap with a sleek black dial.', price: 3299, stock: 50 },
                            ] },
                    ],
                },
            ],
        },
    ];
    for (const typeData of taxonomyData) {
        let typeEntity = await typeRepo.findOneBy({ name: typeData.type });
        if (!typeEntity) {
            typeEntity = await typeRepo.save(typeRepo.create({ name: typeData.type }));
        }
        for (const catData of typeData.categories) {
            let catEntity = await catRepo.findOneBy({ name: catData.name, productTypeId: typeEntity.id });
            if (!catEntity) {
                catEntity = await catRepo.save(catRepo.create({ name: catData.name, productTypeId: typeEntity.id }));
            }
            for (const subData of catData.subs) {
                let subEntity = await subRepo.findOneBy({ name: subData.name, categoryId: catEntity.id });
                if (!subEntity) {
                    subEntity = await subRepo.save(subRepo.create({ name: subData.name, categoryId: catEntity.id }));
                }
                for (const prodData of subData.products) {
                    const exists = await prodRepo.findOneBy({ name: prodData.name });
                    if (!exists) {
                        await prodRepo.save(prodRepo.create({
                            name: prodData.name,
                            description: prodData.description,
                            price: prodData.price,
                            stock: prodData.stock,
                            subCategoryId: subEntity.id,
                        }));
                    }
                }
            }
        }
    }
    console.log('Seed complete.');
    await data_source_1.AppDataSource.destroy();
}
seed().catch(err => {
    console.error('Error during seeding:', err);
    process.exit(1);
});
