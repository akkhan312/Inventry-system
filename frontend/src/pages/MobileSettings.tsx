import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    ChevronRight,
    Camera,
    Bell,
    Shield,
    Smartphone,
    Languages,
    LogOut
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import api, { BASE_URL } from '../services/api';

const MobileSettings = () => {
    const navigate = useNavigate();
    const { currentUser, language, toggleLanguage, dir, updateCurrentUser } = useDashboard();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const translations = {
        en: {
            title: 'Settings',
            profile: 'Profile',
            security: 'Security',
            preferences: 'Preferences',
            language: 'Language',
            currentLang: 'English',
            logout: 'Sign Out',
            name: 'Full Name',
            email: 'Email Address',
            saveChanges: 'Save Changes',
            editProfile: 'Edit Profile',
            notifications: 'Notifications',
            privacy: 'Privacy & Security',
            help: 'Help & Support',
            appearance: 'Appearance',
            cancel: 'Cancel',
            updatePassword: 'Update Password',
            currentPass: 'Current Password',
            newPass: 'New Password',
            confirmPass: 'Confirm Password'
        },
        ar: {
            title: 'الإعدادات',
            profile: 'الملف الشخصي',
            security: 'الأمان',
            preferences: 'التفضيلات',
            language: 'اللغة',
            currentLang: 'العربية',
            logout: 'تسجيل الخروج',
            name: 'الاسم الكامل',
            email: 'البريد الإلكتروني',
            saveChanges: 'حفظ التغييرات',
            editProfile: 'تعديل الملف',
            notifications: 'التنبيهات',
            privacy: 'الخصوصية والأمان',
            help: 'المساعدة والدعم',
            appearance: 'المظهر',
            cancel: 'إلغاء',
            updatePassword: 'تحديث كلمة المرور',
            currentPass: 'كلمة المرور الحالية',
            newPass: 'كلمة المرور الجديدة',
            confirmPass: 'تأكيد كلمة المرور'
        }
    };

    const t = translations[language];

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/mobile-login');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.patch(`/users/profile/${currentUser?.id}`, {
                name: formData.name,
                email: formData.email,
                ...(formData.newPassword && { password: formData.newPassword })
            });

            updateCurrentUser(response.data.user);
            setIsEditing(false);
            setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const SettingItem = ({ icon: Icon, label, value, onClick, color = "text-gray-600", secondary = "" }: any) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 bg-white active:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ${color}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-[15px] font-semibold text-gray-900">{label}</p>
                    {secondary && <p className="text-xs text-gray-500 mt-0.5">{secondary}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {value && <span className="text-sm text-gray-500">{value}</span>}
                <ChevronRight size={18} className={`text-gray-400 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </div>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24" dir={dir}>
            {/* Header */}
            <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100 sticky top-0 z-10 transition-shadow">
                <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            </div>

            {/* Profile Summary */}
            <div className="p-6 bg-white mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-2xl bg-blue-50 border-2 border-blue-100 overflow-hidden flex items-center justify-center">
                            {currentUser?.avatar ? (
                                <img src={`${BASE_URL}${currentUser.avatar}`} alt={currentUser.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-blue-400" />
                            )}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg border-2 border-white active:scale-95 transition-transform">
                            <Camera size={14} />
                        </button>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-900">{currentUser?.name}</h2>
                        <p className="text-sm text-gray-500">{currentUser?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                            {currentUser?.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
                {/* Profile Section */}
                <div className="bg-white border-y border-gray-100">
                    <div className={`px-6 py-3 bg-gray-50/50 border-b border-gray-100 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[1.5px]">{t.profile}</span>
                    </div>
                    <SettingItem
                        icon={User}
                        label={t.editProfile}
                        secondary={currentUser?.name}
                        onClick={() => setIsEditing(true)}
                    />
                    <SettingItem
                        icon={Bell}
                        label={t.notifications}
                        color="text-amber-500"
                        onClick={() => { }}
                    />
                </div>

                {/* App Settings */}
                <div className="bg-white border-y border-gray-100">
                    <div className={`px-6 py-3 bg-gray-50/50 border-b border-gray-100 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[1.5px]">{t.preferences}</span>
                    </div>
                    <SettingItem
                        icon={Languages}
                        label={t.language}
                        value={t.currentLang}
                        color="text-indigo-500"
                        onClick={toggleLanguage}
                    />
                    <SettingItem
                        icon={Smartphone}
                        label={t.appearance}
                        value="System"
                        color="text-purple-500"
                        onClick={() => { }}
                    />
                </div>

                {/* Security & Support */}
                <div className="bg-white border-y border-gray-100">
                    <div className={`px-6 py-3 bg-gray-50/50 border-b border-gray-100 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[1.5px]">{t.security}</span>
                    </div>
                    <SettingItem
                        icon={Shield}
                        label={t.privacy}
                        color="text-emerald-500"
                        onClick={() => { }}
                    />
                </div>

                {/* Logout */}
                <div className="px-6 mt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl font-bold active:bg-red-100 transition-colors"
                    >
                        <LogOut size={20} />
                        {t.logout}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-6 font-medium">GST Inventory v2.1.0 • Built for Mobile</p>
                </div>
            </div>

            {/* Edit Profile Sidebar/Modal (Custom for mobile) */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col justify-end animate-in fade-in duration-300">
                    <div className="bg-white rounded-t-[32px] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-gray-900">{t.editProfile}</h3>
                            <button onClick={() => setIsEditing(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                &times;
                            </button>
                        </div>

                        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>}

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">{t.name}</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase ml-1">{t.email}</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 space-y-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(37,99,235,0.3)] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? '...' : t.saveChanges}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold active:bg-gray-200 transition-all"
                                >
                                    {t.cancel}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileSettings;
