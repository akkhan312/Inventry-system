import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
    }
});

const isEmailConfigured = () => {
    return process.env.SMTP_USER &&
        process.env.SMTP_USER !== 'your-email@gmail.com' &&
        process.env.SMTP_PASS &&
        process.env.SMTP_PASS !== 'your-app-password';
};



// Send password reset email
export const sendPasswordResetEmail = async (userEmail: string, resetToken: string) => {
    if (!isEmailConfigured()) {
        console.warn('⚠️ SMTP not configured. Skipping password reset email for:', userEmail);
        return;
    }

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: process.env.FROM_EMAIL || 'GST System <noreply@gstsystem.com>',
        to: userEmail,
        subject: '🔑 Password Reset Request - GST System',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 14px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                    .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 15px 0; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔑 Password Reset</h1>
                        <p>Reset your password</p>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>We received a request to reset your password for your GST Inventory System account.</p>
                        <p>Click the button below to reset your password:</p>
                        
                        <div style="text-align: center;">
                            <a href="${resetLink}" class="button">Reset Password</a>
                        </div>
                        
                        <div class="warning">
                            <p><strong>⚠️ Security Notice:</strong></p>
                            <p>This link will expire in 1 hour for security reasons.</p>
                            <p>If you didn't request this, please ignore this email.</p>
                        </div>
                        
                        <p style="margin-top: 30px;">Thank you,<br/><strong>GST System Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2024 GST Inventory Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent to:', userEmail);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

// Verify email configuration
export const verifyEmailConfig = async () => {
    if (!isEmailConfigured()) {
        console.log('ℹ️ SMTP is not configured yet (placeholders detected). Email notifications are disabled.');
        return false;
    }

    try {
        await transporter.verify();
        console.log('✅ Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('❌ Email server error:', error);
        return false;
    }
};
