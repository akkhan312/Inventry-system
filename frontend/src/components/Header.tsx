import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import ProfileModal from './ProfileModal';
import api, { BASE_URL } from '../services/api';

// Simple helper for relative time
const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
};

const Header = () => {
    const { currentUser } = useDashboard();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
            setHasUnreadNotifications(response.data.some((n: any) => !n.isRead));
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const handleMarkAllRead = async () => {
        try {
            // In a real app we might have a bulk mark-read endpoint
            // For now we'll just clear all as read or delete if we want to empty the list
            // The existing clearAllNotifications deletes them
            await api.delete('/notifications');
            setNotifications([]);
            setHasUnreadNotifications(false);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            // Check if any unread left
            setHasUnreadNotifications(notifications.some(n => n.id !== id && !n.isRead));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    return (
        <>
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-start px-6 fixed top-0 right-0 left-64 z-20">
                <div className="flex items-center gap-6">
                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        >
                            <Bell size={20} className="text-gray-600" />
                            {hasUnreadNotifications && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline cursor-pointer">
                                        Clear all
                                    </button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                                className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                                            >
                                                <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                                <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatRelativeTime(new Date(notif.createdAt))}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-8 text-center text-gray-500">
                                            <p className="text-sm">No notifications</p>
                                        </div>
                                    )}
                                </div>
                                <div className="px-4 py-2 border-t border-gray-100 text-center">
                                    <button className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer">View All</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Button */}
                    <div>
                        <button
                            onClick={() => setShowProfileModal(true)}
                            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 pr-2 transition-colors cursor-pointer"
                        >
                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xs overflow-hidden">
                                {currentUser?.avatar ? (
                                    <img src={`${BASE_URL}${currentUser.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    currentUser?.username?.substring(0, 2).toUpperCase() || 'U'
                                )}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-semibold text-gray-800 leading-none">{currentUser?.name || currentUser?.username || 'User'}</span>
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Profile Modal */}
            <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
        </>
    );
};

export default Header;
