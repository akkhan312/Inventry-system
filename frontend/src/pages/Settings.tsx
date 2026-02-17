import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';

/* ============================================================================
   TYPES & INTERFACES
   ============================================================================ */

interface AdminUser {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    status?: string;
    createdAt?: string;
}

/* ============================================================================
   STYLES & CONSTANTS
   ============================================================================ */

// Matching the provided CSS variables with Tailwind classes
const STYLES = {
    primary: 'bg-[#4A90E2] hover:bg-[#3A7BC8]', // var(--primary-color)
    text: 'text-[#2C3E50]', // var(--text-color)
    textMuted: 'text-[#6C757D]', // var(--text-muted)
    border: 'border-[#E1E8ED]', // var(--border-color)
    card: 'bg-white rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.05)] border border-[#E1E8ED]',
    tableHeader: 'bg-[#f8f9fa] text-[#2C3E50] font-semibold uppercase tracking-wider text-xs',
    badge: {
        active: 'bg-[rgba(46,204,113,0.1)] text-[#2ECC71]', // var(--success-color)
        inactive: 'bg-gray-100 text-gray-600',
    },
    input: 'w-full px-4 py-3 border border-[#E1E8ED] rounded-lg text-sm focus:outline-none focus:border-[#4A90E2] focus:ring-4 focus:ring-[rgba(74,144,226,0.1)] transition-all duration-300',
    inputError: 'border-[#E74C3C]',
    label: 'block mb-2 text-sm font-medium text-[#2C3E50]',
    btn: {
        primary: 'px-6 py-2.5 bg-[#4A90E2] text-white font-semibold rounded-lg hover:bg-[#3A7BC8] transition-all duration-300 shadow-[0_4px_8px_rgba(74,144,226,0.3)] hover:-translate-y-0.5',
        secondary: 'px-5 py-2.5 bg-[#e9ecef] text-[#2C3E50] font-semibold rounded-lg hover:bg-[#dee2e6] transition-all duration-300',
        icon: 'p-2 text-[#6C757D] hover:text-[#4A90E2] transition-colors duration-200',
        delete: 'p-2 text-[#6C757D] hover:text-[#E74C3C] transition-colors duration-200'
    }
};

/* ============================================================================
   COMPONENT: SettingsPage
   ============================================================================ */

const SettingsPage: React.FC = () => {
    // --- State Management ---
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Create Form State
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        role: 'admin',
        password: '',
        confirmPassword: '',
    });
    const [createAdminAvatar, setCreateAdminAvatar] = useState<File | null>(null);

    // Edit Form State
    const [editFormData, setEditFormData] = useState({
        name: '',
        username: '',
        email: '',
        role: 'admin',
        password: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});

    const isMounted = useRef(true);

    /* ============================================================================
       API ACTIONS
       ============================================================================ */

    const fetchAdmins = useCallback(async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true);
            const response = await api.get('/users');
            if (isMounted.current) {
                setAdmins(response.data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            if (isMounted.current) {
                showNotification('Failed to fetch users', 'error');
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        fetchAdmins(true);
        return () => { isMounted.current = false; };
    }, [fetchAdmins]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    /* ============================================================================
       HANDLERS: Create Admin
       ============================================================================ */

    const openModal = () => {
        setFormData({ name: '', username: '', email: '', role: 'mobile_user', password: '', confirmPassword: '' });
        setCreateAdminAvatar(null);
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.role) newErrors.role = 'Role must be selected';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            if (createAdminAvatar) {
                const data = new FormData();
                data.append('name', formData.name);
                data.append('username', formData.username);
                data.append('email', formData.email);
                data.append('role', formData.role);
                data.append('password', formData.password);
                data.append('avatar', createAdminAvatar);
                await api.post('/users', data);
            } else {
                await api.post('/users', {
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    role: formData.role,
                    password: formData.password
                });
            }

            showNotification('Admin created successfully!', 'success');
            closeModal();
            fetchAdmins();
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create admin';
            showNotification(msg, 'error');
            setErrors({ submit: msg });
        }
    };

    /* ============================================================================
       HANDLERS: Edit Admin
       ============================================================================ */

    const openEditModal = (admin: AdminUser) => {
        setEditingAdmin(admin);
        setEditFormData({
            name: admin.name || '',
            username: admin.username || '',
            email: admin.email || '',
            role: admin.role || 'mobile_user',
            password: ''
        });
        setEditErrors({});
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingAdmin(null);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
        if (editErrors[e.target.name]) {
            setEditErrors({ ...editErrors, [e.target.name]: '' });
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAdmin) return;
        const newErrors: { [key: string]: string } = {};
        if (!editFormData.name) newErrors.name = 'Name is required';
        if (!editFormData.username) newErrors.username = 'Username is required';
        if (!editFormData.email) newErrors.email = 'Email is required';
        if (editFormData.password && editFormData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        setEditErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            try {
                const payload: Record<string, string> = {
                    name: editFormData.name,
                    username: editFormData.username,
                    email: editFormData.email,
                    role: editFormData.role
                };
                if (editFormData.password) payload.password = editFormData.password;

                await api.patch(`/users/${editingAdmin.id}`, payload);
                showNotification('Admin updated successfully!', 'success');
                closeEditModal();
                fetchAdmins();
            } catch (err: any) {
                showNotification(err.response?.data?.message || 'Failed to update admin', 'error');
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this admin?')) return;

        try {
            await api.delete(`/users/${id}`);
            showNotification('Admin deleted successfully!', 'success');
            fetchAdmins();
        } catch (err: any) {
            showNotification(err.response?.data?.message || 'Failed to delete admin', 'error');
        }
    };

    /* ============================================================================
       RENDER
       ============================================================================ */

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-6 lg:p-8 font-inter">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#2C3E50]">Settings</h1>
            </div>

            {/* User Management Card */}
            <div className={STYLES.card}>
                <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b border-[#E1E8ED] gap-4">
                    <h2 className="text-xl font-bold text-[#2C3E50]">User Management</h2>
                    <button
                        onClick={openModal}
                        className={STYLES.btn.primary}
                    >
                        <div className="flex items-center gap-2">
                            <Plus size={18} strokeWidth={2.5} />
                            <span>Add New Admin</span>
                        </div>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className={`px-6 py-4 ${STYLES.tableHeader} border-b-2 border-[#E1E8ED]`}>Name</th>
                                <th className={`px-6 py-4 ${STYLES.tableHeader} border-b-2 border-[#E1E8ED]`}>Username</th>
                                <th className={`px-6 py-4 ${STYLES.tableHeader} border-b-2 border-[#E1E8ED]`}>Email</th>
                                <th className={`px-6 py-4 ${STYLES.tableHeader} border-b-2 border-[#E1E8ED]`}>Role</th>
                                <th className={`px-6 py-4 ${STYLES.tableHeader} border-b-2 border-[#E1E8ED]`}>Status</th>
                                <th className={`px-6 py-4 ${STYLES.tableHeader} border-b-2 border-[#E1E8ED] text-right`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-[#4A90E2] border-t-transparent rounded-full animate-spin"></div>
                                            <span className="font-medium">Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : admins.length > 0 ? (
                                admins.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors border-b border-[#E1E8ED] last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#4A90E2] flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                    {user.avatar ? (
                                                        <img src={`http://localhost:5000${user.avatar}`} alt={user.name} className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        user.name?.charAt(0).toUpperCase() || 'U'
                                                    )}
                                                </div>
                                                <span className="font-semibold text-[#2C3E50]">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#6C757D] font-medium">{user.username}</td>
                                        <td className="px-6 py-4 text-sm text-[#6C757D] font-medium">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-3 py-1 rounded-md bg-blue-50 text-[#4A90E2] text-xs font-bold uppercase tracking-wide border border-blue-100">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${STYLES.badge.active}`}>
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditModal(user)} className={STYLES.btn.icon} title="Edit User">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className={STYLES.btn.delete} title="Delete User">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                        No users found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ============================================================================
               MODAL: Create Admin
               ============================================================================ */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-[#E1E8ED] flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-[#2C3E50]">Create New Admin</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className={STYLES.label}>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`${STYLES.input} ${errors.name ? STYLES.inputError : ''}`}
                                        placeholder="John Doe"
                                    />
                                    {errors.name && <p className="text-[#E74C3C] text-xs mt-1.5 font-medium">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className={STYLES.label}>Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`${STYLES.input} ${errors.username ? STYLES.inputError : ''}`}
                                        placeholder="johndoe"
                                    />
                                    {errors.username && <p className="text-[#E74C3C] text-xs mt-1.5 font-medium">{errors.username}</p>}
                                </div>
                            </div>

                            <div>
                                <label className={STYLES.label}>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`${STYLES.input} ${errors.email ? STYLES.inputError : ''}`}
                                    placeholder="john@example.com"
                                />
                                {errors.email && <p className="text-[#E74C3C] text-xs mt-1.5 font-medium">{errors.email}</p>}
                            </div>

                            {/* Optional: Avatar Upload UI could go here, keeping it simple for now as requested */}

                            <div>
                                <label className={STYLES.label}>Role</label>
                                <div className="relative">
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className={`${STYLES.input} appearance-none cursor-pointer`}
                                    >
                                        <option value="admin">Administrator</option>
                                        <option value="mobile_user">Mobile User</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className={STYLES.label}>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`${STYLES.input} ${errors.password ? STYLES.inputError : ''}`}
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <p className="text-[#E74C3C] text-xs mt-1.5 font-medium">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className={STYLES.label}>Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`${STYLES.input} ${errors.confirmPassword ? STYLES.inputError : ''}`}
                                        placeholder="••••••••"
                                    />
                                    {errors.confirmPassword && <p className="text-[#E74C3C] text-xs mt-1.5 font-medium">{errors.confirmPassword}</p>}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-[#E1E8ED] mt-4">
                                <button type="button" onClick={closeModal} className={STYLES.btn.secondary}>Cancel</button>
                                <button type="submit" className={STYLES.btn.primary}>Create Admin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================================
               MODAL: Edit Admin
               ============================================================================ */}
            {editModalOpen && editingAdmin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-[#E1E8ED] flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-[#2C3E50]">Edit Admin</h3>
                            <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="px-8 py-8 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className={STYLES.label}>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleEditChange}
                                        className={`${STYLES.input} ${editErrors.name ? STYLES.inputError : ''}`}
                                    />
                                    {editErrors.name && <p className="text-[#E74C3C] text-xs mt-1.5 font-medium">{editErrors.name}</p>}
                                </div>
                                <div>
                                    <label className={STYLES.label}>Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={editFormData.username}
                                        onChange={handleEditChange}
                                        className={`${STYLES.input} ${editErrors.username ? STYLES.inputError : ''}`}
                                    />
                                    {editErrors.username && <p className="text-[#E74C3C] text-xs mt-1.5 font-medium">{editErrors.username}</p>}
                                </div>
                            </div>

                            <div>
                                <label className={STYLES.label}>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditChange}
                                    className={`${STYLES.input} ${editErrors.email ? STYLES.inputError : ''}`}
                                />
                                {editErrors.email && <p className="text-[#E74C3C] text-xs mt-1.5 font-medium">{editErrors.email}</p>}
                            </div>

                            <div>
                                <label className={STYLES.label}>Role</label>
                                <div className="relative">
                                    <select
                                        name="role"
                                        value={editFormData.role}
                                        onChange={handleEditChange}
                                        className={`${STYLES.input} appearance-none cursor-pointer`}
                                    >
                                        <option value="admin">Administrator</option>
                                        <option value="mobile_user">Mobile User</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className={STYLES.label}>
                                    New Password <span className="text-[#6C757D] font-normal text-xs ml-1">(Optional)</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={editFormData.password}
                                    onChange={handleEditChange}
                                    className={`${STYLES.input} ${editErrors.password ? STYLES.inputError : ''}`}
                                    placeholder="Leave blank to keep current"
                                />
                                {editErrors.password && <p className="text-[#E74C3C] text-xs mt-1.5 font-medium">{editErrors.password}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-[#E1E8ED] mt-4">
                                <button type="button" onClick={closeEditModal} className={STYLES.btn.secondary}>Cancel</button>
                                <button type="submit" className={STYLES.btn.primary}>Update Admin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-xl font-semibold text-white text-sm z-[100] animate-in slide-in-from-right fade-in duration-300 flex items-center gap-3 ${notification.type === 'success' ? 'bg-[#2ECC71]' : 'bg-[#E74C3C]'}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
