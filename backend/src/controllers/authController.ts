import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { createNotification } from './notificationController.js';

import fs from 'fs';

export const login = async (req: Request, res: Response) => {
    const { username, password, identifier } = req.body;

    try {
        fs.appendFileSync('server.log', `[${new Date().toISOString()}] Login Request: ${JSON.stringify(req.body)}\n`);
    } catch (e) { console.error('Logging failed', e); }

    const loginInput = (identifier || username || '').trim();

    if (!loginInput || !password) {
        try {
            fs.appendFileSync('server.log', `[${new Date().toISOString()}] Login Failed: Missing input\n`);
        } catch (e) { }
        console.log('[DEBUG] Login failed: Missing input or password');
        return res.status(400).json({ message: 'Email/username and password are required' });
    }

    try {
        // Find user by username OR email
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: loginInput },
                    { email: loginInput.toLowerCase() }
                ]
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );



        // Add persistent notification
        createNotification(
            'New Login',
            'New login',
            'info',
            user.id
        ).catch(err => console.error('Failed to create login notification:', err));

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                avatar: user.avatar
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const register = async (req: Request, res: Response) => {
    const { username, email, password, name, role } = req.body;

    try {
        const userExists = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }]
            }
        });

        if (userExists) return res.status(400).json({ error: 'User already exists' });

        // Validate role - only allow specific roles
        const validRoles = ['admin', 'user', 'mobile_user', 'worker'];
        const userRole = role && validRoles.includes(role) ? role : 'user';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.create({
            data: {
                username,
                name: name || username,
                email,
                password: hashedPassword,
                role: userRole,
                status: 'active'
            }
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Forgot Password - Send reset email
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        const successMessage = 'If an account exists with this email, you will receive a password reset link shortly.';

        if (!user) {
            return res.json({ message: successMessage });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token and expiry to DB
        await (prisma.user as any).update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
            }
        });

        // Send email
        await sendPasswordResetEmail(user.email, resetToken);

        res.json({ message: successMessage });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset Password - Update password with token
export const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token and not expired
        const user = await (prisma.user as any).findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        // Update password and clear token fields
        await (prisma.user as any).update({
            where: { id: user.id },
            data: {
                password,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        res.json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Social Login Simulation
export const socialLogin = async (req: Request, res: Response) => {
    const { provider } = req.params;

    // In a real app, you would redirect to the provider's OAuth URL
    // Here we simulate a successful redirect back to the callback with mock data
    const mockCode = `mock_code_${provider}_${Date.now()}`;
    res.json({
        redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/auth/callback?provider=${provider}&code=${mockCode}`
    });
};

export const socialLoginCallback = async (req: Request, res: Response) => {
    const { provider, code } = req.body;

    if (!provider || !code) {
        return res.status(400).json({ message: 'Provider and code are required' });
    }

    try {
        // Mocking user profile extraction from social provider
        const mockProfiles: any = {
            google: { email: 'google_user@example.com', name: 'Google User', id: 'g123', avatar: 'https://lh3.googleusercontent.com/a/ACg8ocL...' },
            facebook: { email: 'fb_user@example.com', name: 'Facebook User', id: 'fb123', avatar: 'https://graph.facebook.com/...' },
            microsoft: { email: 'ms_user@example.com', name: 'Microsoft User', id: 'ms123', avatar: 'https://avatar.microsoft.com/...' }
        };

        const profile = mockProfiles[provider] || mockProfiles.google;

        // Find or create user
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { providerId: profile.id },
                    { email: profile.email }
                ]
            }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    username: `${provider}_${profile.id}`,
                    email: profile.email,
                    name: profile.name,
                    password: crypto.randomBytes(16).toString('hex'), // Random password for social users
                    role: 'user',
                    status: 'active',
                    provider: provider,
                    providerId: profile.id,
                    avatar: profile.avatar
                }
            });
        } else if (!user.providerId) {
            // Link social account to existing email user
            await (prisma as any).user.update({
                where: { id: user.id },
                data: {
                    provider: provider,
                    providerId: profile.id,
                    avatar: user.avatar || profile.avatar
                }
            });
            // Re-fetch user
            user = await prisma.user.findUnique({ where: { id: user.id } });
        }

        const token = jwt.sign(
            { userId: user?.id, role: user?.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user?.id,
                username: user?.username,
                name: user?.name,
                email: user?.email,
                role: user?.role,
                status: user?.status,
                avatar: user?.avatar
            }
        });
    } catch (err) {
        console.error('Social login callback error:', err);
        res.status(500).json({ message: 'Social authentication failed' });
    }
};
