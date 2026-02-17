import React, { useState, useRef, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import api, { BASE_URL } from '../services/api';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { currentUser, updateCurrentUser } = useDashboard();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && currentUser) {
            setFormData({
                name: currentUser.name || '',
                username: currentUser.username || '',
                email: currentUser.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setAvatarPreview(currentUser.avatar ? `${BASE_URL}${currentUser.avatar}` : null);
            setAvatarFile(null);
            setNotification(null);
        }
    }, [isOpen, currentUser]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setNotification(null);

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setNotification({ message: 'New passwords do not match', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('username', formData.username);
            data.append('email', formData.email);
            if (formData.currentPassword) data.append('currentPassword', formData.currentPassword);
            if (formData.newPassword) data.append('newPassword', formData.newPassword);
            if (avatarFile) data.append('avatar', avatarFile);

            const response = await api.patch(`/users/profile/${currentUser?.id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            updateCurrentUser(response.data.user);
            setNotification({ message: 'Profile updated successfully!', type: 'success' });

            // Clear sensitive fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

        } catch (err: any) {
            setNotification({
                message: err.response?.data?.message || 'Failed to update profile',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl overflow-hidden border-4 border-gray-50 shadow-sm">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        currentUser?.username?.substring(0, 2).toUpperCase() || 'US'
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                            >
                                Change Photo
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        {/* User Info Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                    placeholder="johndoe"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Role</label>
                                <input
                                    type="text"
                                    value={currentUser?.role || ''}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm capitalize"
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-900">Change Password</h4>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        {notification && (
                            <div className={`p-3 rounded-lg text-sm ${notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {notification.message}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
