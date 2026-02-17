import { useState } from 'react';
import { Eye, EyeOff, Package } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useDashboard } from '../context/DashboardContext';

const MobileLogin = () => {
    const navigate = useNavigate();
    const { language, toggleLanguage, dir, updateCurrentUser } = useDashboard();
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
        remember: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const translations = {
        en: {
            brandName: 'GST Inventory',
            tagline: 'Management System',
            emailLabel: 'Username or Email',
            emailPlaceholder: 'Enter username or email',
            passwordLabel: 'Password',
            passwordPlaceholder: 'Enter your password',
            rememberMe: 'Remember me',
            forgotPassword: 'Forgot password?',
            signIn: 'Sign In',
            noAccount: "Don't have an account?",
            signUp: 'Sign Up',
            adminLogin: 'Admin Login',
            loading: 'Signing in...'
        },
        ar: {
            brandName: 'إدارة المخزون GST',
            tagline: 'نظام الإدارة',
            emailLabel: 'اسم المستخدم أو البريد الإلكتروني',
            emailPlaceholder: 'أدخل اسم المستخدم أو البريد الإلكتروني',
            passwordLabel: 'كلمة المرور',
            passwordPlaceholder: 'أدخل كلمة المرور',
            rememberMe: 'تذكرني',
            forgotPassword: 'نسيت كلمة المرور؟',
            signIn: 'تسجيل الدخول',
            noAccount: 'ليس لديك حساب؟',
            signUp: 'إنشاء حساب',
            adminLogin: 'تسجيل دخول المسؤول',
            loading: 'جاري تسجيل الدخول...'
        }
    };

    const t = translations[language];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                identifier: formData.identifier,
                password: formData.password
            });

            const { token, user } = response.data;

            // Check if user has mobile access
            if (user.role !== 'mobile_user' && user.role !== 'worker') {
                setError('This account does not have mobile access. Please use the admin login.');
                setLoading(false);
                return;
            }

            // Store auth data
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));

            // Sync global user state
            updateCurrentUser(user);

            // Redirect to mobile UI
            navigate('/mobile-ui');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#5C8DBC] to-[#4A90E2] flex items-center justify-center p-4" dir={dir}>
            <main className="w-full max-w-md bg-white rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] p-8 relative">
                {/* Language Toggle */}
                <div
                    className={`absolute top-5 ${dir === 'rtl' ? 'left-5' : 'right-5'} w-[70px] h-[34px] rounded-full cursor-pointer flex items-center justify-between px-[5px] transition-all ${language === 'ar' ? 'bg-[#4A90E2]' : 'bg-gray-300'
                        }`}
                    onClick={toggleLanguage}
                >
                    <span className={`text-white font-semibold text-xs z-10 transition-opacity ${language === 'en' ? 'opacity-100' : 'opacity-50'}`}>
                        EN
                    </span>
                    <span className={`text-white font-semibold text-xs z-10 transition-opacity ${language === 'ar' ? 'opacity-100' : 'opacity-50'}`}>
                        AR
                    </span>
                    <div className={`absolute top-1 ${language === 'ar' ? 'left-1 translate-x-[36px]' : 'left-1'} w-[26px] h-[26px] bg-white rounded-full shadow-md transition-transform`}></div>
                </div>

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-[70px] h-[70px] bg-[#4A90E2] rounded-2xl mb-4 shadow-[0_5px_15px_rgba(74,144,226,0.3)]">
                        <Package size={30} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#2C3E50]">{t.brandName}</h1>
                    <p className="text-[#6C757D] mt-2">{t.tagline}</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email/Username */}
                    <div className="mb-6 text-left" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        <label className="block mb-2 font-medium text-sm text-[#2C3E50]">
                            {t.emailLabel}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.identifier}
                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                className="w-full px-4 py-[15px] border border-[#E1E8ED] rounded-xl text-base transition-all focus:outline-none focus:border-[#4A90E2] focus:shadow-[0_0_0_3px_#E6F0FA]"
                                placeholder={t.emailPlaceholder}
                                required
                                style={{ paddingRight: dir === 'rtl' ? '15px' : '45px', paddingLeft: dir === 'rtl' ? '45px' : '15px' }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-6 text-left" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        <label className="block mb-2 font-medium text-sm text-[#2C3E50]">
                            {t.passwordLabel}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-[15px] border border-[#E1E8ED] rounded-xl text-base transition-all focus:outline-none focus:border-[#4A90E2] focus:shadow-[0_0_0_3px_#E6F0FA]"
                                placeholder={t.passwordPlaceholder}
                                required
                                style={{ paddingRight: dir === 'rtl' ? '45px' : '15px', paddingLeft: dir === 'rtl' ? '15px' : '45px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute top-1/2 -translate-y-1/2 text-[#6C757D] cursor-pointer ${dir === 'rtl' ? 'left-4' : 'right-4'}`}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="flex justify-between items-center mb-6 text-sm">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={formData.remember}
                                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                className="accent-[#4A90E2]"
                                style={{ marginRight: dir === 'rtl' ? '0' : '8px', marginLeft: dir === 'rtl' ? '8px' : '0' }}
                            />
                            <label htmlFor="remember">{t.rememberMe}</label>
                        </div>
                        <Link to="/forgot-password" className="text-[#4A90E2] font-medium hover:underline">
                            {t.forgotPassword}
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-[15px] bg-[#4A90E2] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all mb-6 hover:bg-[#3A7BC8] hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(74,144,226,0.4)] disabled:opacity-50"
                    >
                        {loading ? t.loading : t.signIn}
                    </button>
                </form>

                {/* Signup Link */}
                <div className="text-center text-sm text-[#6C757D]">
                    {t.noAccount}{' '}
                    <Link to="/mobile-signup" className="text-[#4A90E2] font-medium hover:underline">
                        {t.signUp}
                    </Link>
                </div>

                {/* Admin Login Link */}
                <div className="text-center mt-4">
                    <Link to="/login" className="text-xs text-[#6C757D] hover:text-[#2C3E50]">
                        {t.adminLogin} →
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default MobileLogin;
