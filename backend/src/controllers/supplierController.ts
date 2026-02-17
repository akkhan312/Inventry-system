import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getAllSuppliers = async (req: Request, res: Response) => {
    try {
        const suppliers = await (prisma as any).supplier.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
};

export const createSupplier = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, gstin, address } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Supplier name is required' });
        }

        const supplier = await (prisma as any).supplier.create({
            data: { name, email, phone, gstin, address }
        });
        res.status(201).json(supplier);
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(500).json({ error: 'Failed to create supplier' });
    }
};

export const updateSupplier = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, phone, gstin, address } = req.body;

        const supplier = await (prisma as any).supplier.update({
            where: { id },
            data: { name, email, phone, gstin, address }
        });
        res.json(supplier);
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ error: 'Failed to update supplier' });
    }
};

export const deleteSupplier = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await (prisma as any).supplier.delete({
            where: { id }
        });
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ error: 'Failed to delete supplier' });
    }
};
