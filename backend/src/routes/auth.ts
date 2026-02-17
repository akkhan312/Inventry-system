import express from 'express';
import { login, register, forgotPassword, resetPassword, socialLogin, socialLoginCallback } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Social Login
router.get('/social-login/:provider', socialLogin);
router.post('/social-login/callback', socialLoginCallback);

export default router;
