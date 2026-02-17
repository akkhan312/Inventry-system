import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await (prisma as any).customer.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, gstin, address } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Customer name is required' });
        }

        const customer = await (prisma as any).customer.create({
            data: { name, email, phone, gstin, address }
        });
        res.status(201).json(customer);
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, phone, gstin, address } = req.body;

        const customer = await (prisma as any).customer.update({
            where: { id },
            data: { name, email, phone, gstin, address }
        });
        res.json(customer);
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
};

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await (prisma as any).customer.delete({
            where: { id }
        });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
};
