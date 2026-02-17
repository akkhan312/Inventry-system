import prisma from '../lib/prisma.js';
import { dashboardCache } from '../lib/cache.js';
import * as XLSX from 'xlsx';
export const listMappings = async (req, res) => {
    try {
        const mappings = await prisma.barcodeMapping.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(mappings);
    }
    catch (error) {
        console.error('Error listing barcode mappings:', error);
        res.status(500).json({ error: 'Failed to list barcode mappings' });
    }
};
export const createMapping = async (req, res) => {
    // ... (existing code)
    try {
        const { barcode, seriesNumber, item, quantity, location, config, manufactureDate, binLocation, reference, length, width, height, weight } = req.body;
        if (!barcode || !seriesNumber || !item || !quantity) {
            return res.status(400).json({ error: 'Barcode, series number, item, and quantity are required' });
        }
        const mapping = await prisma.barcodeMapping.create({
            data: {
                barcode,
                seriesNumber,
                item,
                quantity: Number(quantity),
                location: location || 'Pending',
                status: 'pending',
                config,
                manufactureDate,
                binLocation,
                reference,
                length: length ? Number(length) : null,
                width: width ? Number(width) : null,
                height: height ? Number(height) : null,
                weight: weight ? Number(weight) : null
            }
        });
        res.status(201).json(mapping);
    }
    catch (error) {
        console.error('Error creating barcode mapping:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Barcode already exists' });
        }
        res.status(500).json({ error: 'Failed to create barcode mapping' });
    }
};
export const approveMapping = async (req, res) => {
    try {
        const { id } = req.params;
        const mapping = await prisma.barcodeMapping.update({
            where: { id },
            data: { status: 'mapped' }
        });
        // Optionally update product metadata if barcode matches product SKU
        await prisma.product.updateMany({
            where: { sku: mapping.barcode },
            data: {
                quantity: {
                    increment: mapping.quantity
                }
            }
        }).catch(err => console.error('Failed to update product quantity:', err));
        dashboardCache.invalidate('dashboard_data');
        res.json(mapping);
    }
    catch (error) {
        console.error('Error approving barcode mapping:', error);
        res.status(500).json({ error: 'Failed to approve barcode mapping' });
    }
};
export const deleteMapping = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.barcodeMapping.delete({ where: { id } });
        res.json({ message: 'Barcode mapping deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting barcode mapping:', error);
        res.status(500).json({ error: 'Failed to delete barcode mapping' });
    }
};
export const exportMappingsToExcel = async (req, res) => {
    try {
        const mappings = await prisma.barcodeMapping.findMany({
            orderBy: { createdAt: 'desc' }
        });
        const data = mappings.map((m) => ({
            'Serial Number': m.seriesNumber,
            'Barcode/GTIN': m.barcode,
            'Item Name': m.item,
            'Quantity': m.quantity,
            'Location': m.location,
            'Status': m.status,
            'Config': m.config || '',
            'MFG Date': m.manufactureDate || '',
            'Bin Location': m.binLocation || '',
            'Reference': m.reference || '',
            'Dimensions (L/W/H)': `${m.length || 0}/${m.width || 0}/${m.height || 0}`,
            'Weight': m.weight || 0,
            'Created At': m.createdAt
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Barcode Mappings");
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', 'attachment; filename=barcode_mappings.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    }
    catch (error) {
        console.error('Error exporting barcode mappings:', error);
        res.status(500).json({ error: 'Failed to export barcode mappings' });
    }
};
