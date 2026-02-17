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
                    create: items.map((item) => ({
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
        // Update matching products
        for (const item of items) {
            const sku = item.barcode || item.sku;
            await prisma.product.updateMany({
                where: { sku: sku },
                data: {
                    quantity: {
                        set: item.quantity
                    }
                }
            }).catch(err => console.error(`Failed to update product ${sku}:`, err));
        }
        // Invalidate dashboard cache
        dashboardCache.invalidate('dashboard_data');
        // Create notification for sync
        await createNotification('Inventory Sync Completed', `Inventory for ${submission.location.name} has been synced (${items.length} items).`, 'info');
        res.status(201).json(submission);
    }
    catch (error) {
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
    }
    catch (error) {
        console.error('Error fetching mobile summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});
export default router;
