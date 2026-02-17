import express, { json, Request, Response, NextFunction } from 'express';
import cors from 'cors';
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

// Enable trust proxy to correctly handle headers from Nginx/Load Balancer
app.set('trust proxy', 1);

// CORS Configuration
const allowedOrigins = [
    'https://inventory.gstsa1.org',
    'https://inventoryapi.gstsa1.org',
    'http://localhost:5000',
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`[CORS] Rejected origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(compression());
app.use(json());
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    console.log('[DEBUG] Headers:', JSON.stringify(req.headers));
    console.log('[DEBUG] Body:', JSON.stringify(req.body));
    next();
});
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
