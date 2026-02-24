import express from 'express';
import prisma from '../lib/prisma.js';
import { dashboardCache } from '../lib/cache.js';
import * as locationController from '../controllers/locationController.js';
import { createNotification } from '../controllers/notificationController.js';

const router = express.Router();

// Locations for mobile
router.get('/locations', locationController.getAllLocations);

// Sync offline inventory
router.post('/sync', async (req, res) => {
    try {
        const { locationId, items, status = 'offline', meta } = req.body;

        if (!locationId || !items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Location ID and items array are required' });
        }

        const name = (meta?.name != null && String(meta.name).trim()) ? String(meta.name).trim() : null;
        const countedBy = (meta?.countedBy != null && String(meta.countedBy).trim()) ? String(meta.countedBy).trim() : null;
        const employeeId = (meta?.employeeId != null && String(meta.employeeId).trim()) ? String(meta.employeeId).trim() : null;

        // Create inventory submission and update product quantities if needed
        const submission = await prisma.inventorySubmission.create({
            data: {
                locationId,
                status,
                submittedAt: new Date(),
                name,
                countedBy,
                employeeId,
                items: {
                    create: items.map((item: any) => ({
                        sku: item.barcode || item.sku,
                        name: item.name,
                        quantity: item.quantity,
                        expectedQuantity: 0
                    }))
                }
            },
            include: {
                items: true,
                location: true
            }
        });

        // Ensure countedBy and employeeId are persisted (explicit update in case client omitted them on create)
        if (submission?.id && (countedBy != null || employeeId != null)) {
            await prisma.inventorySubmission.update({
                where: { id: submission.id },
                data: {
                    ...(countedBy != null && countedBy !== '' && { countedBy }),
                    ...(employeeId != null && employeeId !== '' && { employeeId })
                }
            }).catch(() => { });
        }

        // Update existing products or auto-create new ones from scanned barcodes
        let autoCreatedCount = 0;
        for (const item of items) {
            const sku = item.barcode || item.sku;

            // First try to find by sku
            const existingBySku = await prisma.product.findUnique({ where: { sku } }).catch(() => null);

            // Also try to find by barcode field if no SKU match
            const existingByBarcode = !existingBySku
                ? await (prisma.product as any).findFirst({ where: { barcode: sku } }).catch(() => null)
                : null;

            const existing = existingBySku || existingByBarcode;

            if (existing) {
                // Update quantity of the matched product
                await prisma.product.update({
                    where: { id: existing.id },
                    data: { quantity: item.quantity }
                }).catch(err => console.error(`Failed to update product ${sku}:`, err));
            } else {
                // Auto-create new master data product from scanned item
                try {
                    const qty = item.quantity ?? 0;
                    await (prisma.product as any).create({
                        data: {
                            name: item.name || `Item ${sku}`,
                            sku: sku,
                            category: item.category || 'Uncategorized',
                            quantity: qty,
                            purchasePrice: 0,
                            salePrice: 0,
                            unit: 'pcs',
                            gstRate: 18,
                            status: qty <= 0 ? 'out' : (qty <= 10 ? 'low' : 'in'),
                            openingStock: qty,
                            minStock: 10,
                            reorderPoint: 15,
                            barcode: sku,
                            location: 'Main Warehouse',
                        }
                    });
                    autoCreatedCount++;
                    console.log(`[Sync] Auto-created new product: ${sku} - ${item.name}`);
                } catch (createErr: any) {
                    console.error(`[Sync] Failed to auto-create product ${sku}:`, createErr.message);
                }
            }
        }

        // Invalidate dashboard cache
        dashboardCache.invalidate('dashboard_data');

        // Create notification for sync
        await createNotification(
            'Inventory Sync Completed',
            `Inventory for ${submission.location.name} has been synced (${items.length} items${autoCreatedCount > 0 ? `, ${autoCreatedCount} new product(s) added to master data` : ''}).`,
            'info'
        );

        res.status(201).json(submission);
    } catch (error) {
        console.error('Error syncing inventory:', error);
        res.status(500).json({ error: 'Failed to sync inventory' });
    }
});

// Get inventory summary for mobile dashboard
router.get('/summary', async (req, res) => {
    try {
        const totalSubmissions = await prisma.inventorySubmission.count();
        const recentSubmissions = await prisma.inventorySubmission.findMany({
            take: 5,
            orderBy: { submittedAt: 'desc' },
            include: { location: true }
        });

        res.json({
            totalSubmissions,
            recentSubmissions
        });
    } catch (error) {
        console.error('Error fetching mobile summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

export default router;
