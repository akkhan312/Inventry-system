import express, { json, Request, Response, NextFunction } from 'express';
import compression from 'compression';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import inventoryRoutes from './routes/inventory.js';
import usersRoutes from './routes/users.js';
import supplierRoutes from './routes/suppliers.js';
import customerRoutes from './routes/customers.js';
import reportRoutes from './routes/reports.js';
import notificationRoutes from './routes/notifications.js';
import prisma from './lib/prisma.js';
import mobileRoutes from './routes/mobile.js';
import locationRoutes from './routes/locations.js';
import barcodeRoutes from './routes/barcode.js';
import { verifyEmailConfig } from './services/emailService.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(compression());

// Manual CORS Middleware - MUST BE BEFORE ALL OTHER MIDDLEWARE
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[CORS DEBUG] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});

app.use(json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/mobile', mobileRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/barcode-mapping', barcodeRoutes);

// Error Handler
app.use(errorHandler);

// Database connection check
const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);

    prisma.$connect()
        .then(() => {
            console.log('Connected to MongoDB via Prisma');
        })
        .catch((err: any) => {
            console.error('Database connection error:', err);
        });

    // Check email configuration
    verifyEmailConfig();
});

// Keep process alive
process.on('SIGINT', () => {
    server.close(() => {
        prisma.$disconnect();
        process.exit(0);
    });
});
