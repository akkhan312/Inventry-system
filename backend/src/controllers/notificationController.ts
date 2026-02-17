import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

/**
 * Get all notifications for the current user or system-wide
 */
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const { recipientId } = req.query;

        const notifications = await (prisma as any).notification.findMany({
            where: recipientId ? {
                OR: [
                    { recipientId: null },
                    { recipientId: recipientId as string }
                ]
            } : {},
            orderBy: { createdAt: 'desc' }
        });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

/**
 * Mark a specific notification as read
 */
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const notification = await (prisma as any).notification.update({
            where: { id },
            data: { isRead: true }
        });

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
};

/**
 * Clear all notifications (mark as read or delete)
 */
export const clearAllNotifications = async (req: Request, res: Response) => {
    try {
        const { recipientId } = (req.query as any);

        await (prisma as any).notification.deleteMany({
            where: recipientId ? { recipientId: recipientId as string } : {}
        });

        res.json({ message: 'Notifications cleared successfully' });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
};

/**
 * Helper function to create system notifications
 */
export const createNotification = async (title: string, message: string, type: string = 'info', recipientId?: string) => {
    try {
        await (prisma as any).notification.create({
            data: {
                title,
                message,
                type,
                recipientId
            }
        });
    } catch (error) {
        console.error('Error creating local notification:', error);
    }
};
