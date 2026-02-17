import dotenv from 'dotenv';
dotenv.config();
import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
    try {
        console.log('Seeding database via Prisma...');
        await prisma.$connect();
        console.log('Connected to database.');

        // 1. Seed Users (Admin & Mobile User)
        const hashedPassword = await bcrypt.hash('123456', 10);
        const adminPassword = await bcrypt.hash('alikhan123', 10);

        const users = [
            {
                email: 'alikhanse248@gmail.com',
                username: 'engrali123',
                name: 'Ali Khan',
                password: adminPassword,
                role: 'administrator',
                status: 'active',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali'
            },
            {
                email: 'mobile@gst.com',
                username: 'mobileuser',
                name: 'Mobile Operator',
                password: hashedPassword,
                role: 'user', // typically mobile users might have 'user' role
                status: 'active',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mobile'
            },
            {
                email: 'manager@gst.com',
                username: 'storemanager',
                name: 'Store Manager',
                password: hashedPassword,
                role: 'user',
                status: 'active',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager'
            }
        ];

        for (const u of users) {
            await prisma.user.upsert({
                where: { email: u.email },
                update: {},
                create: u
            });
        }
        console.log('Users seeded');

        // 2. Seed Locations
        const locationsData = [
            { name: 'Riyadh Central Warehouse', address: 'King Fahd Rd, Riyadh', type: 'warehouse', status: 'active' },
            { name: 'Jeddah Distribution Center', address: 'King Abdulaziz Rd, Jeddah', type: 'warehouse', status: 'active' },
            { name: 'Dammam Store', address: 'Prince Mohammed bin Fahd Rd, Dammam', type: 'store', status: 'active' },
            { name: 'Mecca Delivery Hub', address: 'Ibrahim Al Khalil St, Mecca', type: 'distribution', status: 'active' },
            { name: 'Medina Supply Point', address: 'King Abdullah Rd, Medina', type: 'distribution', status: 'active' }
        ];

        for (const loc of locationsData) {
            // Using findFirst to avoid duplicates since name isn't unique in schema
            const exists = await prisma.location.findFirst({ where: { name: loc.name } });
            if (!exists) {
                await prisma.location.create({ data: loc });
            }
        }
        console.log('Locations seeded');

        // 3. Seed Suppliers
        const suppliersData = [
            { name: 'Al-Marai Co.', email: 'contact@almarai.com', phone: '+966 11 470 0005', gstin: '300001234500003', address: 'Riyadh, Saudi Arabia' },
            { name: 'Jarir Bookstore', email: 'b2b@jarir.com', phone: '+966 11 462 6000', gstin: '300006789000003', address: 'Riyadh, Saudi Arabia' },
            { name: 'Saudi Electronics', email: 'sales@saudielectro.com', phone: '+966 11 222 3333', gstin: '300009876500003', address: 'Jeddah, Saudi Arabia' }
        ];

        for (const sup of suppliersData) {
            const exists = await prisma.supplier.findFirst({ where: { name: sup.name } });
            if (!exists) {
                await prisma.supplier.create({ data: sup });
            }
        }
        console.log('Suppliers seeded');

        // 4. Seed Customers
        const customersData = [
            { name: 'Hyper Panda', email: 'procurement@panda.com.sa', phone: '+966 11 222 1111', gstin: '310001234500003', address: 'Riyadh' },
            { name: 'Danube Markets', email: 'info@danube.sa', phone: '+966 12 666 7777', gstin: '310006789000003', address: 'Jeddah' },
            { name: 'Lulu Hypermarket', email: 'corporate@lulu.com', phone: '+966 13 888 9999', gstin: '310009876500003', address: 'Dammam' }
        ];

        for (const cust of customersData) {
            const exists = await prisma.customer.findFirst({ where: { name: cust.name } });
            if (!exists) {
                await prisma.customer.create({ data: cust });
            }
        }
        console.log('Customers seeded');

        // 5. Seed Products
        const productsData = [
            {
                name: 'Galaxy Chocolate Bar', sku: 'CHO-001', category: 'Confectionery', quantity: 500, purchasePrice: 2.50, salePrice: 4.00, status: 'in',
                openingStock: 450, minStock: 50, reorderPoint: 100, location: 'Riyadh Central Warehouse', supplier: 'Al-Marai Co.', batchNumber: 'BATCH-001', expiryDate: new Date('2025-12-31')
            },
            {
                name: 'Lery Apple Juice', sku: 'BEV-001', category: 'Beverages', quantity: 200, purchasePrice: 3.00, salePrice: 5.50, status: 'in',
                openingStock: 180, minStock: 30, reorderPoint: 60, location: 'Jeddah Distribution Center', supplier: 'Al-Marai Co.', batchNumber: 'BATCH-002', expiryDate: new Date('2024-10-15')
            },
            {
                name: 'Signal Toothpaste', sku: 'PER-001', category: 'Personal Care', quantity: 150, purchasePrice: 8.00, salePrice: 12.00, status: 'in',
                openingStock: 120, minStock: 20, reorderPoint: 40, location: 'Dammam Store', supplier: 'Saudi Electronics', batchNumber: 'BATCH-003', expiryDate: new Date('2026-05-20')
            },
            {
                name: 'Nivea Body Lotion', sku: 'PER-002', category: 'Personal Care', quantity: 80, purchasePrice: 15.00, salePrice: 25.00, status: 'in',
                openingStock: 90, minStock: 15, reorderPoint: 30, location: 'Riyadh Central Warehouse', supplier: 'Saudi Electronics', batchNumber: 'BATCH-004', expiryDate: new Date('2025-08-10')
            },
            {
                name: 'Sony Headphones', sku: 'ELE-001', category: 'Electronics', quantity: 15, purchasePrice: 150.00, salePrice: 250.00, status: 'low',
                openingStock: 20, minStock: 10, reorderPoint: 15, location: 'Jeddah Distribution Center', supplier: 'Saudi Electronics', batchNumber: 'SN-X100', expiryDate: null
            },
            {
                name: 'Samsung Charger', sku: 'ELE-002', category: 'Electronics', quantity: 40, purchasePrice: 25.00, salePrice: 45.00, status: 'in',
                openingStock: 35, minStock: 10, reorderPoint: 20, location: 'Dammam Store', supplier: 'Saudi Electronics', batchNumber: 'SN-Y200', expiryDate: null
            },
            {
                name: 'Notebook A4', sku: 'STA-001', category: 'Stationery', quantity: 300, purchasePrice: 5.00, salePrice: 10.00, status: 'in',
                openingStock: 280, minStock: 50, reorderPoint: 100, location: 'Mecca Delivery Hub', supplier: 'Jarir Bookstore', batchNumber: 'BATCH-S01', expiryDate: null
            },
            {
                name: 'Ballpoint Pen Blue', sku: 'STA-002', category: 'Stationery', quantity: 0, purchasePrice: 1.00, salePrice: 2.00, status: 'out',
                openingStock: 100, minStock: 50, reorderPoint: 100, location: 'Medina Supply Point', supplier: 'Jarir Bookstore', batchNumber: 'BATCH-S02', expiryDate: null
            }
        ];

        for (const prod of productsData) {
            await prisma.product.upsert({
                where: { sku: prod.sku },
                update: {},
                create: prod
            });
        }
        console.log('Products seeded');

        console.log('Database seeded successfully!');
        process.exit();
    } catch (err: any) {
        console.error('Error seeding database:', err.message || err);
        process.exit(1);
    }
};

seedData();
