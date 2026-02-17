import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getAllLocations = async (req: Request, res: Response) => {
    try {
        const locations = await prisma.location.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
};

export const createLocation = async (req: Request, res: Response) => {
    try {
        const { name, address, type, manager, status } = req.body;

        if (!name || !address || !type) {
            return res.status(400).json({ error: 'Name, address, and type are required' });
        }

        const location = await prisma.location.create({
            data: {
                name,
                address,
                type,
                manager: manager || undefined,
                status: status || 'active'
            }
        });

        res.status(201).json(location);
    } catch (error) {
        console.error('Error creating location:', error);
        res.status(500).json({ error: 'Failed to create location' });
    }
};

export const updateLocation = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, address, type, manager, status } = req.body;

        // Verify exists
        const exists = await prisma.location.findUnique({
            where: { id }
        });

        if (!exists) {
            return res.status(404).json({ error: 'Location not found' });
        }

        const updateData: { name?: string; address?: string; type?: string; manager?: string | null; status?: string } = {};
        if (name != null) updateData.name = name;
        if (address != null) updateData.address = address;
        if (type != null) updateData.type = type;
        if (manager !== undefined) updateData.manager = manager || null;
        if (status != null) updateData.status = status;

        const location = await prisma.location.update({
            where: { id },
            data: updateData
        });

        res.json(location);
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: 'Failed to update location' });
    }
};

export const deleteLocation = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        // Check if there are any submissions for this location
        const hasSubmissions = await prisma.inventorySubmission.findFirst({
            where: { locationId: id }
        });

        if (hasSubmissions) {
            return res.status(400).json({
                error: 'Cannot delete location that has inventory submissions associated with it.'
            });
        }

        await prisma.location.delete({
            where: { id }
        });

        res.json({ message: 'Location deleted successfully' });
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({ error: 'Failed to delete location' });
    }
};
