import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import * as XLSX from 'xlsx';

// getGstSummary removed as Invoice module is deleted

export const getInventoryValuation = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany();

        const valuation = products.reduce((acc: any, prod: any) => {
            const purchaseValue = prod.quantity * (prod.purchasePrice || 0);
            const saleValue = prod.quantity * (prod.salePrice || 0);

            return {
                totalPurchaseValue: acc.totalPurchaseValue + purchaseValue,
                totalSaleValue: acc.totalSaleValue + saleValue,
                totalProfitPotential: acc.totalProfitPotential + (saleValue - purchaseValue)
            };
        }, { totalPurchaseValue: 0, totalSaleValue: 0, totalProfitPotential: 0 });

        res.json(valuation);
    } catch (error) {
        console.error('Error calculating valuation:', error);
        res.status(500).json({ error: 'Failed to calculate valuation' });
    }
};

export const exportProductsToExcel = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany();

        const data = products.map(p => ({
            SKU: p.sku,
            Name: p.name,
            Category: p.category,
            Quantity: p.quantity,
            'Purchase Price': p.purchasePrice,
            'Sale Price': p.salePrice,
            'GST Rate': p.gstRate,
            Status: p.status,
            'Created At': p.createdAt
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Products");

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting products:', error);
        res.status(500).json({ error: 'Failed to export products' });
    }
};

// exportInvoicesToExcel removed as Invoice module is deleted

export const exportInventorySubmissionToExcel = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const submission = await prisma.inventorySubmission.findUnique({
            where: { id },
            include: { location: true, items: true }
        }) as any;

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const data = submission.items.map((item: any) => ({
            'Item Code': item.sku,
            'Item Name': item.name,
            'System Qty': item.expectedQuantity,
            'Counted Qty': item.quantity,
            'Variance': item.quantity - item.expectedQuantity
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Adjust column widths
        const wscols = [
            { wch: 15 }, // SKU
            { wch: 30 }, // Name
            { wch: 12 }, // System Qty
            { wch: 12 }, // Counted Qty
            { wch: 10 }, // Variance
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Inventory Count");

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        const filename = `inventory_${submission.location.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error('Error exporting inventory submission:', error);
        res.status(500).json({ error: 'Failed to export inventory submission' });
    }
};
