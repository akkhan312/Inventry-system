import { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import { useIsMobile } from '../hooks/useMediaQuery';

const Profile = () => {
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const isMobile = useIsMobile();

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { name: 'Guest', role: 'User', email: 'guest@example.com', username: 'guest' };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setProfilePic(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowModal(false);
        setNotification('Profile updated successfully!');
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <div className={`flex flex-col max-w-5xl mx-auto space-y-4 md:space-y-6 ${isMobile ? '' : 'mt-8'}`}>
            {isMobile && <MobileHeader title="My Profile" />}

            {!isMobile && (
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                </div>
            )}

            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${isMobile ? 'mx-4' : ''}`}>
                {/* Banner */}
                <div className={`${isMobile ? 'h-24' : 'h-32'} bg-blue-600 relative`}></div>

                <div className={`${isMobile ? 'px-4' : 'px-8'} pb-8`}>
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-4">
                            {/* Profile Picture */}
                            <div
                                className="w-24 h-24 rounded-full bg-white p-1 shadow-lg relative cursor-pointer group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500 overflow-hidden border-2 border-white">
                                    {!profilePic && (
                                        <span className="group-hover:hidden">{getInitials(user.name)}</span>
                                    )}
                                    {profilePic && <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />}
                                    <Camera className="hidden group-hover:block text-gray-600 absolute inset-0 m-auto" size={24} />
                                </div>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            {/* Name & Role */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                                <p className="text-gray-500 capitalize">{user.role}</p>
                            </div>
                        </div>

                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                            onClick={() => setShowModal(true)}
                        >
                            Edit Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Personal Information */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                                    Personal Information
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-800">
                                        <User size={18} className="text-gray-400" /> {user.name} (@{user.username})
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-800">
                                        <Mail size={18} className="text-gray-400" /> {user.email || 'No email provided'}
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-800">
                                        <Phone size={18} className="text-gray-400" /> +1 (555) 123-4567
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-800">
                                        <MapPin size={18} className="text-gray-400" /> New York, USA
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Security */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                                    Account Security
                                </h4>
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <button type="submit" className="text-blue-600 font-medium hover:underline cursor-pointer">
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setShowModal(false)}
                >
                    <div className="bg-white rounded-xl w-11/12 max-w-lg p-6 relative" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer">
                                    {profilePic ? (
                                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>JD</span>
                                    )}
                                    <Camera className="absolute text-gray-600" size={24} />
                                </div>
                                <button
                                    type="button"
                                    className="text-blue-600 hover:underline cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Change Photo
                                </button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Full Name</label>
                                <input type="text" className="w-full border rounded px-3 py-2" defaultValue="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Email</label>
                                <input type="email" className="w-full border rounded px-3 py-2" defaultValue="john.doe@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Role</label>
                                <input type="text" className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed" value="Administrator" readOnly />
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" className="px-4 py-2 rounded bg-gray-200 cursor-pointer" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white cursor-pointer">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification && (
                <div className="fixed top-6 right-6 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
                    {notification}
                </div>
            )}
        </div>
    );
};

export default Profile;
