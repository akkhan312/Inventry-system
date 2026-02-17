import { Settings, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../hooks/useMediaQuery';

const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();

    // Only show on mobile
    if (!isMobile) return null;

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed bottom-2 left-2 right-2 md:hidden bg-white/85 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg z-50">
            <div className="flex justify-around items-center py-2">
                <button
                    onClick={() => navigate('/mobile-settings')}
                    className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl min-w-[60px] transition-colors ${isActive('/mobile-settings')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500'
                        }`}
                >
                    <Settings size={24} className="mb-0.5" />
                    <span className="text-xs font-medium">Settings</span>
                </button>
                <button
                    onClick={() => navigate('/profile')}
                    className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl min-w-[60px] transition-colors ${isActive('/profile')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500'
                        }`}
                >
                    <User size={24} className="mb-0.5" />
                    <span className="text-xs font-medium">Profile</span>
                </button>
            </div>
            {/* iOS-style home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/80 rounded-full" />
        </nav>
    );
};

export default MobileBottomNav;
