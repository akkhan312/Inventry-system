import { useState } from 'react';
import { Eye, EyeOff, Boxes, Globe, User, Lock, Warehouse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useDashboard } from '../context/DashboardContext';
import { useIsMobile } from '../hooks/useMediaQuery';

const translations = {
    en: {
        'brand-name': 'GST Inventory',
        'tagline': 'Management System',
        'welcome': 'Welcome Back',
        'email-label': 'Username or Email',
        'email-placeholder': '@gmail.com', // Svg placeholder from screenshot
        'password-label': 'Password',
        'password-placeholder': 'Enter your password',
        'remember-me': 'Remember me',
        'forgot-password': 'Forgot password?',
        'sign-in': 'Sign In',
        'no-account': "Don't have an account?",
        'request-access': 'Request access',
        'copyright': '© 2024 GST System. All rights reserved.',
        'error-prefix': 'Error: ',
        'loading': 'Signing in...',
        'or': 'OR'
    },
    ar: {
        'brand-name': 'إدارة المخزون GST',
        'tagline': 'نظام الإدارة',
        'welcome': 'مرحباً بعودتك',
        'email-label': 'اسم المستخدم أو البريد الإلكتروني',
        'email-placeholder': '@gmail.com',
        'password-label': 'كلمة المرور',
        'password-placeholder': 'أدخل كلمة المرور',
        'remember-me': 'تذكرني',
        'forgot-password': 'نسيت كلمة المرور؟',
        'sign-in': 'تسجيل الدخول',
        'no-account': 'ليس لديك حساب؟',
        'request-access': 'اطلب الوصول',
        'copyright': '© 2024 نظام GST. جميع الحقوق محفوظة.',
        'error-prefix': 'خطأ: ',
        'loading': 'جاري تسجيل الدخول...',
        'or': 'أو'
    }
};

const Login = () => {
    const { language, toggleLanguage, dir, updateCurrentUser } = useDashboard();
    const isMobile = useIsMobile();
    const t = translations[language];

    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { username, password });
            sessionStorage.setItem('token', response.data.token);
            const userData = response.data.user;
            sessionStorage.setItem('user', JSON.stringify(userData));

            // Check for Admin privileges
            const allowedAdminRoles = ['admin', 'user'];
            if (!allowedAdminRoles.includes(userData.role)) {
                setError('Access Denied: You do not have permission to access the Admin Dashboard.');
                setIsLoading(false);
                return;
            }

            // Sync global user state
            updateCurrentUser(userData);

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        try {
            const response = await api.get(`/auth/social-login/${provider}`);
            if (response.data.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            }
        } catch (err: any) {
            setError(`Failed to initiate ${provider} login`);
        }
    };


    if (isMobile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#5C8DBC] to-[#4A90E2] flex items-center justify-center p-4 transition-all duration-300">
                <main className="w-full max-w-[400px] bg-white rounded-[20px] shadow-2xl p-8 relative overflow-hidden animate-in fade-in zoom-in duration-500">
                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="absolute top-5 ltr:right-5 rtl:left-5 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-200 cursor-pointer"
                    >
                        <Globe size={14} className="text-blue-600" />
                        <span>{language === 'en' ? 'AR' : 'EN'}</span>
                    </button>

                    {/* Logo Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-[70px] h-[70px] bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
                            <Boxes size={36} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{t['brand-name']}</h1>
                        <p className="text-gray-500 text-sm mt-1">{t['tagline']}</p>
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">{t['welcome']}</h2>

                    <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100">
                                {t['error-prefix']}{error}
                            </div>
                        )}

                        {/* Username/Email Field */}
                        <div className="space-y-1 md:space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mx-1">
                                {t['email-label']}
                            </label>
                            <div className="relative">
                                {!isMobile && (
                                    <div className={`absolute inset-y-0 flex items-center px-4 pointer-events-none text-gray-400 ${dir === 'rtl' ? 'right-0' : 'left-0'}`}>
                                        <User size={18} />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`w-full py-3.5 md:py-4 bg-blue-50/30 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700 placeholder-gray-400 ${!isMobile ? (dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4') : 'px-5'}`}
                                    placeholder={t['email-placeholder']}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1 md:space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mx-1">
                                {t['password-label']}
                            </label>
                            <div className="relative">
                                {!isMobile && (
                                    <div className={`absolute inset-y-0 flex items-center px-4 pointer-events-none text-gray-400 ${dir === 'rtl' ? 'right-0' : 'left-0'}`}>
                                        <Lock size={18} />
                                    </div>
                                )}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full py-3.5 md:py-4 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700 placeholder-gray-400 ${!isMobile ? (dir === 'rtl' ? 'pr-12 pl-12' : 'pl-12 pr-12') : 'px-5 pr-12'}`}
                                    placeholder={t['password-placeholder']}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute inset-y-0 text-gray-400 hover:text-blue-600 transition-colors px-4 cursor-pointer ${dir === 'rtl' ? 'left-0' : 'right-0'}`}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="mx-2 text-sm text-gray-600 group-hover:text-blue-600 transition-colors leading-none">
                                    {t['remember-me']}
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                                {t['forgot-password']}
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3.5 md:py-4 rounded-lg md:rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading && <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                            {isLoading ? t['loading'] : t['sign-in']}
                        </button>

                        {!isMobile && (
                            <>
                                <div className="relative my-6 md:my-8 text-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase tracking-widest bg-white px-4 text-gray-400">
                                        {t['or']}
                                    </div>
                                </div>

                                {/* Social Buttons */}
                                <div className="flex justify-center gap-4">
                                    {['google', 'microsoft', 'facebook'].map((provider) => (
                                        <button
                                            key={provider}
                                            type="button"
                                            onClick={() => handleSocialLogin(provider)}
                                            className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {provider === 'google' && <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#757575" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#757575" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#757575" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#757575" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>}
                                            {provider === 'microsoft' && <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#757575" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" /></svg>}
                                            {provider === 'facebook' && <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#757575"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Request Access */}
                        <div className="text-center pt-2 md:pt-4">
                            <p className="text-sm text-gray-600">
                                {t['no-account']}{' '}
                                <button type="button" className="text-blue-600 hover:text-blue-700 font-bold ml-1">
                                    {t['request-access']}
                                </button>
                            </p>
                        </div>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-[10px] text-gray-400 mt-8 uppercase tracking-widest font-bold">
                        {t['copyright']}
                    </p>
                </main>
            </div>
        );
    }

    // Web / Desktop Layout
    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-6 relative">
            {/* Background decoration */}
            <div className="fixed inset-0 bg-[#f8faff] -z-10"></div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <main className="w-full max-w-[1000px] flex min-h-[600px] bg-white rounded-[20px] shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-500">
                {/* Left Panel - Brand */}
                <div className="w-1/2 bg-blue-600 p-12 flex flex-col items-center justify-between text-white text-center relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-10 -mb-10"></div>

                    <div className="relative z-10 w-full">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl mb-6 shadow-xl">
                            <Boxes size={40} className="text-white" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tight mb-2">GST</h1>
                        <p className="text-blue-100 text-lg font-medium opacity-90">{t['tagline']}</p>
                    </div>

                    <div className="relative z-10 opacity-30 mt-auto">
                        <Warehouse size={180} strokeWidth={1} />
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="w-1/2 p-14 flex flex-col justify-center relative">
                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="absolute top-8 right-8 flex items-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors px-4 py-2 rounded-xl text-xs font-bold text-gray-600 shadow-sm border border-gray-100 cursor-pointer"
                    >
                        <Globe size={16} className="text-blue-600" />
                        <span>{language === 'en' ? 'Arabic' : 'English'}</span>
                    </button>

                    <h2 className="text-3xl font-black text-gray-900 mb-8">{t['welcome']}</h2>

                    <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-100">
                                {t['error-prefix']}{error}
                            </div>
                        )}

                        {/* Username/Email Field */}
                        <div className="space-y-1 md:space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mx-1">
                                {t['email-label']}
                            </label>
                            <div className="relative">
                                {!isMobile && (
                                    <div className={`absolute inset-y-0 flex items-center px-4 pointer-events-none text-gray-400 ${dir === 'rtl' ? 'right-0' : 'left-0'}`}>
                                        <User size={18} />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`w-full py-3.5 md:py-4 bg-blue-50/30 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700 placeholder-gray-400 ${!isMobile ? (dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4') : 'px-5'}`}
                                    placeholder={t['email-placeholder']}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1 md:space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mx-1">
                                {t['password-label']}
                            </label>
                            <div className="relative">
                                {!isMobile && (
                                    <div className={`absolute inset-y-0 flex items-center px-4 pointer-events-none text-gray-400 ${dir === 'rtl' ? 'right-0' : 'left-0'}`}>
                                        <Lock size={18} />
                                    </div>
                                )}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full py-3.5 md:py-4 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700 placeholder-gray-400 ${!isMobile ? (dir === 'rtl' ? 'pr-12 pl-12' : 'pl-12 pr-12') : 'px-5 pr-12'}`}
                                    placeholder={t['password-placeholder']}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute inset-y-0 text-gray-400 hover:text-blue-600 transition-colors px-4 cursor-pointer ${dir === 'rtl' ? 'left-0' : 'right-0'}`}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="mx-2 text-sm text-gray-600 group-hover:text-blue-600 transition-colors leading-none">
                                    {t['remember-me']}
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                                {t['forgot-password']}
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3.5 md:py-4 rounded-lg md:rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isLoading && <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                            {isLoading ? t['loading'] : t['sign-in']}
                        </button>

                        {!isMobile && (
                            <>
                                <div className="relative my-6 md:my-8 text-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase tracking-widest bg-white px-4 text-gray-400">
                                        {t['or']}
                                    </div>
                                </div>

                                {/* Social Buttons */}
                                <div className="flex justify-center gap-4">
                                    {['google', 'microsoft', 'facebook'].map((provider) => (
                                        <button
                                            key={provider}
                                            type="button"
                                            onClick={() => handleSocialLogin(provider)}
                                            className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {provider === 'google' && <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#757575" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#757575" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#757575" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#757575" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>}
                                            {provider === 'microsoft' && <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#757575" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" /></svg>}
                                            {provider === 'facebook' && <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#757575"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Request Access */}
                        <div className="text-center pt-2 md:pt-4">
                            <p className="text-sm text-gray-600">
                                {t['no-account']}{' '}
                                <button type="button" className="text-blue-600 hover:text-blue-700 font-bold ml-1 cursor-pointer">
                                    {t['request-access']}
                                </button>
                            </p>
                        </div>
                    </form>

                    <p className="text-center text-[10px] text-gray-400 mt-12 uppercase tracking-widest font-bold">
                        {t['copyright']}
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Login;
