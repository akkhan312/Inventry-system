import { useState } from 'react';
import { Eye, EyeOff, Package, User, Mail, IdCard } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useDashboard } from '../context/DashboardContext';

const MobileSignup = () => {
    const navigate = useNavigate();
    const { language, toggleLanguage, dir } = useDashboard();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const translations = {
        en: {
            brandName: 'GST Inventory',
            tagline: 'Management System',
            title: 'Create Account',
            subtitle: 'Sign up for mobile access',
            fullNameLabel: 'Full Name',
            fullNamePlaceholder: 'Enter your full name',
            usernameLabel: 'Username',
            usernamePlaceholder: 'Choose a username',
            emailLabel: 'Email',
            emailPlaceholder: 'Enter your email',
            passwordLabel: 'Password',
            passwordPlaceholder: 'Create a password',
            confirmPasswordLabel: 'Confirm Password',
            confirmPasswordPlaceholder: 'Confirm your password',
            signUp: 'Create Account',
            haveAccount: 'Already have an account?',
            signIn: 'Sign In',
            loading: 'Creating account...'
        },
        ar: {
            brandName: 'إدارة المخزون GST',
            tagline: 'نظام الإدارة',
            title: 'إنشاء حساب',
            subtitle: 'التسجيل للوصول عبر الهاتف المحمول',
            fullNameLabel: 'الاسم الكامل',
            fullNamePlaceholder: 'أدخل اسمك الكامل',
            usernameLabel: 'اسم المستخدم',
            usernamePlaceholder: 'اختر اسم مستخدم',
            emailLabel: 'البريد الإلكتروني',
            emailPlaceholder: 'أدخل بريدك الإلكتروني',
            passwordLabel: 'كلمة المرور',
            passwordPlaceholder: 'أنشئ كلمة مرور',
            confirmPasswordLabel: 'تأكيد كلمة المرور',
            confirmPasswordPlaceholder: 'أكد كلمة المرور',
            signUp: 'إنشاء حساب',
            haveAccount: 'لديك حساب بالفعل؟',
            signIn: 'تسجيل الدخول',
            loading: 'جاري إنشاء الحساب...'
        }
    };

    const t = translations[language];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                name: formData.name,
                role: 'mobile_user'
            });

            navigate('/mobile-login', {
                state: { message: 'Account created successfully! Please sign in.' }
            });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
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

                {/* Title */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-[#2C3E50]">{t.title}</h2>
                    <p className="text-sm text-[#6C757D] mt-1">{t.subtitle}</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div className="mb-4 text-left" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        <label className="block mb-2 font-medium text-sm text-[#2C3E50]">
                            {t.fullNameLabel}
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-[#E1E8ED] rounded-xl text-base transition-all focus:outline-none focus:border-[#4A90E2] focus:shadow-[0_0_0_3px_#E6F0FA]"
                            placeholder={t.fullNamePlaceholder}
                            required
                        />
                    </div>

                    {/* Username */}
                    <div className="mb-4 text-left" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        <label className="block mb-2 font-medium text-sm text-[#2C3E50]">
                            {t.usernameLabel}
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-4 py-3 border border-[#E1E8ED] rounded-xl text-base transition-all focus:outline-none focus:border-[#4A90E2] focus:shadow-[0_0_0_3px_#E6F0FA]"
                            placeholder={t.usernamePlaceholder}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-4 text-left" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        <label className="block mb-2 font-medium text-sm text-[#2C3E50]">
                            {t.emailLabel}
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-[#E1E8ED] rounded-xl text-base transition-all focus:outline-none focus:border-[#4A90E2] focus:shadow-[0_0_0_3px_#E6F0FA]"
                            placeholder={t.emailPlaceholder}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4 text-left" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        <label className="block mb-2 font-medium text-sm text-[#2C3E50]">
                            {t.passwordLabel}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 border border-[#E1E8ED] rounded-xl text-base transition-all focus:outline-none focus:border-[#4A90E2] focus:shadow-[0_0_0_3px_#E6F0FA]"
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

                    {/* Confirm Password */}
                    <div className="mb-6 text-left" style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                        <label className="block mb-2 font-medium text-sm text-[#2C3E50]">
                            {t.confirmPasswordLabel}
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-[#E1E8ED] rounded-xl text-base transition-all focus:outline-none focus:border-[#4A90E2] focus:shadow-[0_0_0_3px_#E6F0FA]"
                                placeholder={t.confirmPasswordPlaceholder}
                                required
                                style={{ paddingRight: dir === 'rtl' ? '45px' : '15px', paddingLeft: dir === 'rtl' ? '15px' : '45px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className={`absolute top-1/2 -translate-y-1/2 text-[#6C757D] cursor-pointer ${dir === 'rtl' ? 'left-4' : 'right-4'}`}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-[15px] bg-[#4A90E2] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all mb-6 hover:bg-[#3A7BC8] hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(74,144,226,0.4)] disabled:opacity-50"
                    >
                        {loading ? t.loading : t.signUp}
                    </button>
                </form>

                {/* Login Link */}
                <div className="text-center text-sm text-[#6C757D]">
                    {t.haveAccount}{' '}
                    <Link to="/mobile-login" className="text-[#4A90E2] font-medium hover:underline">
                        {t.signIn}
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default MobileSignup;
