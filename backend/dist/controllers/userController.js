import prisma from '../lib/prisma.js';
import { dashboardCache } from '../lib/cache.js';
const invalidateUserCache = () => {
    dashboardCache.invalidate('users_list');
    dashboardCache.invalidate('users_list_admin');
};
export const getAllUsers = async (req, res) => {
    try {
        const roleFilter = req.query.role?.toLowerCase().trim();
        const cacheKey = roleFilter ? `users_list_${roleFilter}` : 'users_list';
        const cachedUsers = dashboardCache.get(cacheKey);
        if (cachedUsers) {
            return res.json(cachedUsers);
        }
        const users = await prisma.user.findMany({
            where: roleFilter ? { role: roleFilter } : undefined,
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                role: true,
                status: true,
                avatar: true,
                createdAt: true
            }
        });
        dashboardCache.set(cacheKey, users, 60000);
        res.json(users);
    }
    catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
export const createUser = async (req, res) => {
    try {
        const body = req.body || {};
        // Support both JSON body and multipart (multer puts text fields in req.body)
        const name = typeof body.name === 'string' ? body.name.trim() : String(body.name || '').trim();
        const email = typeof body.email === 'string' ? body.email.trim() : String(body.email || '').trim();
        const role = typeof body.role === 'string' ? body.role.trim() : String(body.role || '').trim();
        const password = body.password != null ? String(body.password) : '';
        const username = typeof body.username === 'string' ? body.username.trim() : String(body.username || '').trim();
        if (!name || !email || !role) {
            return res.status(400).json({ message: 'Missing required fields: name, email, and role are required' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password is required and must be at least 6 characters' });
        }
        const cleanEmail = email.toLowerCase();
        const cleanUsername = (username || email.split('@')[0]).toLowerCase();
        // Check for existing email/username
        const userExists = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: cleanEmail },
                    { username: cleanUsername }
                ]
            }
        });
        if (userExists) {
            if (userExists.email === cleanEmail) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            return res.status(400).json({ message: 'Username already taken' });
        }
        // Store avatar path in DB when file is uploaded
        const avatarPath = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;
        const user = await prisma.user.create({
            data: {
                username: cleanUsername,
                name,
                email: cleanEmail,
                password,
                role: role.toLowerCase(),
                status: 'active',
                ...(avatarPath && { avatar: avatarPath })
            }
        });
        // Invalidate user list cache
        invalidateUserCache();
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar ?? undefined
            }
        });
    }
    catch (err) {
        console.error('Create user error:', err);
        const message = err.code === 'P2002'
            ? 'Username or email already exists'
            : (err.message || 'Failed to create user');
        res.status(500).json({ message, error: err.message });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const avatar = req.file ? `/uploads/profiles/${req.file.filename}` : undefined;
        const updateData = {};
        if (name)
            updateData.name = name.trim();
        if (email)
            updateData.email = email.toLowerCase().trim();
        if (password)
            updateData.password = password;
        if (avatar)
            updateData.avatar = avatar;
        const user = await prisma.user.update({
            where: { id: id },
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                status: true
            }
        });
        // Invalidate cache
        invalidateUserCache();
        res.json({
            message: 'Profile updated successfully',
            user
        });
    }
    catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, username, role, password } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name.trim();
        if (email !== undefined)
            updateData.email = email.toLowerCase().trim();
        if (username !== undefined)
            updateData.username = username.trim().toLowerCase();
        if (role !== undefined)
            updateData.role = role.toLowerCase().trim();
        if (password !== undefined && password !== '')
            updateData.password = password;
        const user = await prisma.user.update({
            where: { id: id },
            data: updateData,
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                status: true,
                createdAt: true
            }
        });
        invalidateUserCache();
        res.json({
            message: 'User updated successfully',
            user
        });
    }
    catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ message: 'Failed to update user' });
    }
};
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({
            where: { id: id }
        });
        invalidateUserCache();
        res.json({ message: 'User deleted' });
    }
    catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
