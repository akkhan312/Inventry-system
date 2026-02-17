import { ArrowLeft, Bell, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
    title: string;
    showBack?: boolean;
    onBackClick?: () => void;
}

const MobileHeader = ({ title, showBack = false, onBackClick }: MobileHeaderProps) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBackClick) {
            onBackClick();
        } else {
            navigate(-1);
        }
    };

    return (
        <header className="md:hidden bg-white shadow-sm">
            {/* Status Bar Simulation */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold px-6 pt-2 pb-1 flex justify-between items-center">
                <span className="text-xs">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="flex gap-1.5 items-center text-xs">
                    <i className="fas fa-signal" />
                    <i className="fas fa-wifi" />
                    <i className="fas fa-battery-three-quarters" />
                </div>
            </div>

            {/* App Bar */}
            <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                    {showBack && (
                        <button
                            onClick={handleBack}
                            className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Package size={16} className="text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                    </div>
                </div>
                <button
                    className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    aria-label="Notifications"
                >
                    <Bell size={22} />
                </button>
            </div>
        </header>
    );
};

export default MobileHeader;
