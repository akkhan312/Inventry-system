import { useState } from 'react';
import { ArrowLeft, Mail, Warehouse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setMessage('If an account exists with this email, you will receive a password reset link shortly.');
            setEmail('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to process request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl flex overflow-hidden max-w-5xl w-full">
                {/* Left Side - Blue Gradient Brand Panel */}
                <div className="w-1/2 bg-gradient-to-br from-blue-500 to-blue-600 p-16 flex flex-col items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>

                    <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center mb-8 relative z-10 shadow-lg">
                        <Warehouse size={48} className="text-white" strokeWidth={1.5} />
                    </div>

                    <h1 className="text-6xl font-bold mb-3 relative z-10">GST</h1>
                    <p className="text-blue-100 text-xl font-light relative z-10">Inventory Management System</p>

                    <div className="mt-20 opacity-30 relative z-10">
                        <Mail size={200} strokeWidth={0.5} />
                    </div>
                </div>

                {/* Right Side - Forgot Password Form */}
                <div className="w-1/2 p-16 flex flex-col justify-center bg-white">
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Login
                    </button>

                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Forgot Password?</h2>
                    <p className="text-gray-600 mb-8">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-200">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm font-medium border border-green-200">
                                {message}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3.5 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-8">
                        © 2024 GST System. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
