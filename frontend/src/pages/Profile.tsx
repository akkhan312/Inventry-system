import { useState, useRef, useEffect } from 'react';
import { User, Lock, Edit2, X, Save, Camera, Eye, EyeOff, UserCircle } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useDashboard } from '../context/DashboardContext';
import api, { BASE_URL } from '../services/api';

const Profile = () => {
    const isMobile = useIsMobile();
    const { currentUser, updateCurrentUser } = useDashboard();

    const [isEditing, setIsEditing] = useState(false);
    const [originalData, setOriginalData] = useState<any>({});
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        role: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    // Initialize data
    useEffect(() => {
        if (currentUser) {
            const initialData = {
                name: currentUser.name || '',
                email: currentUser.email || '',
                username: currentUser.username || '',
                role: currentUser.role || 'User',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
            setFormData(initialData);
            setOriginalData(initialData);
        }
    }, [currentUser]);

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel action
            setFormData(originalData); // Reset to original
            setIsEditing(false);
        } else {
            // Start editing
            setIsEditing(true);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSaveChanges = async () => {
        // Validation
        if (!formData.name || !formData.email || !formData.username) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        if (formData.newPassword) {
            if (!formData.currentPassword) {
                showToast('Please enter your current password', 'error');
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                showToast('New passwords do not match', 'error');
                return;
            }
            if (formData.newPassword.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
        }

        setLoading(true);
        try {
            // Call API
            const response = await api.patch(`/users/profile/${currentUser?.id}`, {
                name: formData.name,
                email: formData.email,
                ...(formData.newPassword && {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            // Update success
            updateCurrentUser(response.data.user);
            setOriginalData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
            setIsEditing(false);
            showToast('Profile updated successfully!', 'success');
        } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            // Assume we have an upload endpoint or similar logic implemented in a real scenario
            // For now just simulate or use existing generic update if backend supports it
            await api.post(`/users/${currentUser?.id}/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Refetch or update context manually
            showToast('Profile photo updated!', 'success');
            // Reload window to see changes if context doesn't auto-fetch (simplified)
            window.location.reload();
        } catch (err) {
            showToast('Failed to upload photo', 'error');
        }
    };

    return (
        <div className={`min-h-screen bg-[#F5F5F7] font-sans flex text-[#333] ${isMobile ? 'flex-col' : 'items-center justify-center p-4'}`}>
            {/* If Mobile, show custom header, if Desktop, maybe show nothing or different layout */}
            {isMobile && <MobileHeader title="Profile" showBack={false} />}

            <div className={`w-full max-w-[720px] bg-white ${isMobile ? 'rounded-none min-h-screen' : 'rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] h-[90vh]'} overflow-hidden flex flex-col relative`}>

                {/* Header (Desktop-ish view inside container, Mobile uses MobileHeader conceptually but let's match the design exactly) */}
                <div className="bg-[#1976D2] text-white p-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
                    <h1 className="text-[28px] font-medium flex items-center gap-4">
                        <UserCircle size={32} />
                        Profile
                    </h1>
                    {!isEditing ? (
                        <button
                            onClick={handleEditToggle}
                            className="p-2 hover:bg-white/10 rounded-md transition-colors"
                        >
                            <Edit2 size={24} />
                        </button>
                    ) : (
                        <button
                            // Clicking edit button while editing actually acts as a toggle in some UX, 
                            // but we have dedicated Save/Cancel buttons below. 
                            // Let's hide this button while editing to avoid confusion or make it cancel.
                            onClick={handleEditToggle}
                            className="p-2 hover:bg-white/10 rounded-md transition-colors text-white/50"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-[#F5F5F7]">

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-4">
                            <div className="w-[120px] h-[120px] rounded-full bg-[#E0E0E0] flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                                {currentUser?.avatar ? (
                                    <img src={`${BASE_URL}${currentUser.avatar}`} alt={formData.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={60} className="text-[#757575]" />
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-[#F5F5F5] border border-[#E0E0E0] rounded-[20px] px-4 py-2 text-sm font-medium text-[#424242] flex items-center gap-2 hover:bg-[#E0E0E0] transition-colors"
                        >
                            <Camera size={18} />
                            Change Photo
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Personal Information Section */}
                    <div className="bg-white rounded-[16px] p-5 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                        <div className="text-[18px] font-medium mb-4 text-[#424242] flex items-center gap-2">
                            <User size={20} className="text-[#1976D2]" />
                            Personal Information
                        </div>

                        <div className="mb-4">
                            <label className="block text-[14px] text-[#757575] mb-1.5">Full Name</label>
                            <div className={`w-full flex items-center ${isEditing ? 'bg-white border-[#E0E0E0]' : 'bg-[#F5F5F7] border-transparent'} border rounded-lg px-4 py-3 transition-colors`}>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full bg-transparent outline-none text-[#212121] text-[16px]"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-[14px] text-[#757575] mb-1.5">Email Address</label>
                            <div className={`w-full flex items-center ${isEditing ? 'bg-white border-[#E0E0E0]' : 'bg-[#F5F5F7] border-transparent'} border rounded-lg px-4 py-3 transition-colors`}>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full bg-transparent outline-none text-[#212121] text-[16px]"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-[14px] text-[#757575] mb-1.5">Username</label>
                            <div className="w-full flex items-center bg-[#F5F5F7] border border-transparent rounded-lg px-4 py-3">
                                <input
                                    type="text"
                                    value={formData.username}
                                    disabled
                                    className="w-full bg-transparent outline-none text-[#212121] text-[16px] opacity-70"
                                />
                            </div>
                        </div>

                        <div className="mb-0">
                            <label className="block text-[14px] text-[#757575] mb-1.5">Role</label>
                            <div className="w-full flex items-center bg-[#F5F5F7] border border-transparent rounded-lg px-4 py-3">
                                <input
                                    type="text"
                                    value={formData.role}
                                    disabled
                                    className="w-full bg-transparent outline-none text-[#212121] text-[16px] opacity-70"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="bg-white rounded-[16px] p-5 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                        <div className="text-[18px] font-medium mb-4 text-[#424242] flex items-center gap-2">
                            <Lock size={20} className="text-[#1976D2]" />
                            Change Password
                        </div>

                        <div className="mb-4">
                            <label className="block text-[14px] text-[#757575] mb-1.5">Current Password</label>
                            <div className={`w-full flex items-center relative ${isEditing ? 'bg-white border-[#E0E0E0]' : 'bg-[#F5F5F7] border-transparent'} border rounded-lg px-4 py-3 transition-colors`}>
                                <input
                                    type={showPassword.current ? "text" : "password"}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder={isEditing ? "Enter current password" : "••••••••"}
                                    className="w-full bg-transparent outline-none text-[#212121] text-[16px]"
                                />
                                {isEditing && (
                                    <button onClick={() => togglePasswordVisibility('current')} className="text-[#757575]">
                                        {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-[14px] text-[#757575] mb-1.5">New Password</label>
                            <div className={`w-full flex items-center relative ${isEditing ? 'bg-white border-[#E0E0E0]' : 'bg-[#F5F5F7] border-transparent'} border rounded-lg px-4 py-3 transition-colors`}>
                                <input
                                    type={showPassword.new ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder={isEditing ? "Enter new password" : "••••••••"}
                                    className="w-full bg-transparent outline-none text-[#212121] text-[16px]"
                                />
                                {isEditing && (
                                    <button onClick={() => togglePasswordVisibility('new')} className="text-[#757575]">
                                        {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mb-0">
                            <label className="block text-[14px] text-[#757575] mb-1.5">Confirm New Password</label>
                            <div className={`w-full flex items-center relative ${isEditing ? 'bg-white border-[#E0E0E0]' : 'bg-[#F5F5F7] border-transparent'} border rounded-lg px-4 py-3 transition-colors`}>
                                <input
                                    type={showPassword.confirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder={isEditing ? "Confirm new password" : "••••••••"}
                                    className="w-full bg-transparent outline-none text-[#212121] text-[16px]"
                                />
                                {isEditing && (
                                    <button onClick={() => togglePasswordVisibility('confirm')} className="text-[#757575]">
                                        {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex gap-4 mt-8 animate-in slide-in-from-bottom duration-300">
                            <button
                                onClick={handleEditToggle}
                                className="flex-1 py-3.5 bg-[#F5F5F5] text-[#424242] rounded-lg font-medium text-[16px] hover:bg-[#E0E0E0] transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={20} />
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                disabled={loading}
                                className="flex-1 py-3.5 bg-[#1976D2] text-white rounded-lg font-medium text-[16px] hover:bg-[#1565C0] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                <Save size={20} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom duration-300 ${notification.type === 'error' ? 'bg-[#323232] text-red-400' : 'bg-[#323232] text-white'
                    }`}>
                    {notification.type === 'success' ? <div className="text-green-400"><Save size={20} /></div> : <div className="text-red-400"><X size={20} /></div>}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}
        </div>
    );
};

export default Profile;
