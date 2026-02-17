import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { calculateTotalStockValue } from '../utils/productUtils.js';
import { dashboardCache } from '../lib/cache.js';
import { createNotification } from './notificationController.js';
import * as XLSX from 'xlsx';
import { Prisma } from '@prisma/client';

interface ProductRow {
    Name: string;
    SKU: string;
    Category: string;
    Quantity?: number;
    PurchasePrice?: number;
    SalePrice?: number;
    Unit?: string;
    HSN?: string;
    GSTRate?: number;
    OpeningQty?: number;
    MinStock?: number;
    ReorderQty?: number;
    Location?: string;
    Supplier?: string;
    BatchNumber?: string;
    ExpiryDate?: string;
    [key: string]: any;
}

export const getStats = async (req: Request, res: Response) => {
    try {
        const [totalProducts, lowStockItems, outOfStockItems, categories, allProducts] = await Promise.all([
            prisma.product.count(),
            prisma.product.count({ where: { status: 'low' } }),
            prisma.product.count({ where: { status: 'out' } }),
            prisma.product.groupBy({ by: ['category'] }),
            (prisma.product as any).findMany({ select: { quantity: true, purchasePrice: true } })
        ]);

        const totalStockValue = calculateTotalStockValue(allProducts);

        res.json({
            totalProducts,
            lowStockItems,
            outOfStockItems,
            categoriesCount: categories.length,
            totalStockValue
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'dashboard_data';
        const cachedData = dashboardCache.get(cacheKey);

        if (cachedData) {
            return res.json(cachedData);
        }

        // Fetch invoices for the last 6 months specifically to populate the trend
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const [
            totalProducts,
            lowStockItems,
            outOfStockItems,
            categoryGroups,
            recentProducts,
            physicalCountSessions,
            allProducts
        ] = await Promise.all([
            prisma.product.count(),
            prisma.product.count({ where: { status: 'low' } }),
            prisma.product.count({ where: { status: 'out' } }),
            prisma.product.groupBy({
                by: ['category'],
                _count: { _all: true }
            }),
            prisma.product.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10
            }),
            (prisma as any).physicalCountSession ? (prisma as any).physicalCountSession.count() : Promise.resolve(0),
            (prisma.product as any).findMany({ select: { quantity: true, purchasePrice: true, createdAt: true } })
        ]);

        const totalStockValue = calculateTotalStockValue(allProducts);

        console.log(`[Dashboard] Fetched data: ${totalProducts} products`);

        // Calculate Stock Trend based on Product Creation (Stock In)
        // Since Invoices are removed, we don't have "Stock Out" (Sales) data anymore.
        // We will use Product Creation Date as "Stock In".
        const stockTrendMap: Record<string, { stockIn: number, stockOut: number, timestamp: number }> = {};

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('default', { month: 'short' });
            stockTrendMap[monthName] = { stockIn: 0, stockOut: 0, timestamp: d.getTime() };
        }

        allProducts.forEach((product: any) => {
            const date = new Date(product.createdAt);
            // Check if product was created within the last 6 months
            if (date >= sixMonthsAgo) {
                const monthName = date.toLocaleString('default', { month: 'short' });
                if (stockTrendMap[monthName]) {
                    stockTrendMap[monthName].stockIn += product.quantity;
                }
            }
        });

        // Ensure chronological order
        const stockTrendData = Object.entries(stockTrendMap)
            .map(([month, data]) => ({
                month,
                stockIn: data.stockIn,
                stockOut: data.stockOut
            }))
            .sort((a, b) => {
                return stockTrendMap[a.month].timestamp - stockTrendMap[b.month].timestamp;
            });


        const categoryDistribution = categoryGroups.map(c => ({
            name: c.category || 'Uncategorized',
            value: c._count._all
        }));

        console.log('[Dashboard] Stock Trend Data Points:', stockTrendData.length);
        console.log('[Dashboard] Category Distribution Points:', categoryDistribution.length);

        const dashboardData = {
            stats: {
                totalProducts,
                lowStockItems,
                outOfStockItems,
                categoriesCount: categoryGroups.length,
                physicalCountSessions,
                totalStockValue
            },
            recentProducts,
            stockTrendData,
            categoryDistribution
        };

        dashboardCache.set(cacheKey, dashboardData, 60000);
        res.json(dashboardData);
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getRecentProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch recent products' });
    }
};

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const {
            name, sku, category, quantity, purchasePrice, salePrice,
            hsnCode, gstRate, unit, description, barcode,
            openingStock, minStock, reorderPoint, location, supplier, batchNumber, expiryDate
        } = req.body;

        const product = await (prisma.product as any).create({
            data: {
                name,
                sku,
                category,
                quantity: quantity || 0,
                purchasePrice: purchasePrice || 0,
                salePrice: salePrice || 0,
                hsnCode,
                gstRate: gstRate || 18,
                unit: unit || 'pcs',
                description: description || undefined,
                barcode: barcode || undefined,
                status: (quantity || 0) <= 0 ? 'out' : ((quantity || 0) <= 10 ? 'low' : 'in'),
                openingStock: openingStock || 0,
                minStock: minStock || 10,
                reorderPoint: reorderPoint || 15,
                location: location || "Main Warehouse",
                supplier: supplier || undefined,
                batchNumber: batchNumber || undefined,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined
            }
        });
        dashboardCache.invalidate('dashboard_data');
        res.status(201).json(product);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, sku, category, quantity, purchasePrice, salePrice, hsnCode, gstRate, unit, description, barcode } = req.body;

        const product = await prisma.product.update({
            where: { id: String(id) },
            data: {
                name,
                sku,
                category,
                quantity,
                purchasePrice,
                salePrice,
                hsnCode,
                gstRate,
                unit,
                description,
                barcode,
                status: quantity <= 0 ? 'out' : (quantity <= 10 ? 'low' : 'in')
            }
        });
        dashboardCache.invalidate('dashboard_data');
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id: id as string }
        });
        dashboardCache.invalidate('dashboard_data');
        res.json({ message: 'Product deleted successfully' });
    } catch (err: any) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

export const importProducts = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: ProductRow[] = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'File is empty' });
        }

        let successCount = 0;
        let skipCount = 0;
        const errors: string[] = [];

        for (const row of rows) {
            // Map Excel headers to expected keys
            const name = row.Name || row['Item Name'];
            const sku = row.SKU || row['Item Code'];
            const category = row.Category; // Category usually matches
            const quantity = row.Quantity || row['Current Qty'];
            const purchasePrice = row.PurchasePrice || row['Unit Cost'];
            const salePrice = row.SalePrice || row['Sale Price'];
            const unit = row.Unit || row['UOM'];
            const hsn = row.HSN || row['HSN Code'];
            const gstRate = row.GSTRate || row['GST Rate (%)'] || row['GST Rate'];
            const openingStock = row.OpeningQty || row['Opening Qty'];
            const minStock = row.MinStock || row['Min Stock'];
            const reorderPoint = row.ReorderQty || row['Reorder Qty'];
            const location = row.Location;
            const supplier = row.Supplier;
            const batchNumber = row.BatchNumber || row['Serial / Batch'];
            const expiryDate = row.ExpiryDate || row['Expiry Date'];

            if (!name || !sku || !category) {
                errors.push(`Row missing required fields (Name, SKU, Category): ${JSON.stringify(row)}`);
                skipCount++;
                continue;
            }

            try {
                // Check if SKU exists
                const existingProduct = await prisma.product.findUnique({
                    where: { sku: sku.toString() }
                });

                if (existingProduct) {
                    errors.push(`Product with SKU ${sku} already exists`);
                    skipCount++;
                    continue;
                }

                await (prisma.product as any).create({
                    data: {
                        name: name,
                        sku: sku.toString(),
                        category: category,
                        quantity: Number(quantity) || 0,
                        purchasePrice: Number(purchasePrice) || 0,
                        salePrice: Number(salePrice) || 0,
                        description: row.Description || undefined,
                        barcode: row.Barcode || row['Barcode / QR'] ? (row.Barcode || row['Barcode / QR']).toString() : undefined,
                        unit: unit || 'pcs',
                        hsnCode: hsn ? hsn.toString() : undefined,
                        gstRate: Number(gstRate) || 18,
                        status: (Number(quantity) || 0) <= 0 ? 'out' : ((Number(quantity) || 0) <= 10 ? 'low' : 'in'),
                        openingStock: Number(openingStock) || 0,
                        minStock: Number(minStock) || 10,
                        reorderPoint: Number(reorderPoint) || 15,
                        location: location || "Main Warehouse",
                        supplier: supplier || undefined,
                        batchNumber: batchNumber || undefined,
                        expiryDate: expiryDate ? new Date(expiryDate) : undefined
                    }
                });
                successCount++;
            } catch (err: any) {
                console.error('Error importing product:', err);
                errors.push(`Error importing SKU ${sku}: ${err.message}`);
                skipCount++;
            }
        }

        dashboardCache.invalidate('dashboard_data');
        res.json({
            message: `Import completed. Success: ${successCount}, Skipped: ${skipCount}`,
            successCount,
            skipCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Failed to import products' });
    }
};

export const getAllSubmissions = async (req: Request, res: Response) => {
    try {
        const submissions = await prisma.inventorySubmission.findMany({
            orderBy: { submittedAt: 'desc' },
            include: {
                location: { select: { name: true } },
                _count: { select: { items: true } }
            }
        });
        // Always include countedBy and employeeId in response (explicit so they are never omitted)
        const mapped = submissions.map((s: any) => ({
            id: s.id,
            status: s.status,
            submittedAt: s.submittedAt,
            name: s.name,
            countedBy: s.countedBy != null ? String(s.countedBy) : null,
            employeeId: s.employeeId != null ? String(s.employeeId) : null,
            location: s.location,
            _count: s._count
        }));
        res.json(mapped);
    } catch (err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getSubmissionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const submission = await prisma.inventorySubmission.findUnique({
            where: { id: id as string },
            include: {
                location: true,
                items: true
            }
        });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.json(submission);
    } catch (err) {
        console.error('Error fetching submission:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteSubmission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Verify it exists
        const submission = await prisma.inventorySubmission.findUnique({
            where: { id: id as string }
        });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        await prisma.inventorySubmission.delete({
            where: { id: id as string }
        });

        // Invalidate dashboard cache since physical counts stats might change
        dashboardCache.invalidate('dashboard_data');

        res.json({ message: 'Inventory submission deleted successfully' });
    } catch (err: any) {
        console.error('Error deleting submission:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};
