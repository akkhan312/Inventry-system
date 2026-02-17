import prisma from '../lib/prisma.js';
/**
 * Get all notifications for the current user or system-wide
 */
export const getNotifications = async (req, res) => {
    try {
        const { recipientId } = req.query;
        const notifications = await prisma.notification.findMany({
            where: recipientId ? {
                OR: [
                    { recipientId: null },
                    { recipientId: recipientId }
                ]
            } : {},
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
/**
 * Mark a specific notification as read
 */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.json(notification);
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
};
/**
 * Clear all notifications (mark as read or delete)
 */
export const clearAllNotifications = async (req, res) => {
    try {
        const { recipientId } = req.query;
        await prisma.notification.deleteMany({
            where: recipientId ? { recipientId: recipientId } : {}
        });
        res.json({ message: 'Notifications cleared successfully' });
    }
    catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
};
/**
 * Helper function to create system notifications
 */
export const createNotification = async (title, message, type = 'info', recipientId) => {
    try {
        await prisma.notification.create({
            data: {
                title,
                message,
                type,
                recipientId
            }
        });
    }
    catch (error) {
        console.error('Error creating local notification:', error);
    }
};
