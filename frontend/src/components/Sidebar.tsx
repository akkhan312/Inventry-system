import { Home, Database, Clock, ScanBarcode, Settings, Package } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Sidebar = () => {
    const { currentUser: user } = useDashboard();
    const location = useLocation();

    // Hide sidebar on Mobile UI page and all mobile feature pages (for non-admin users)
    const mobileRoutes = [
        '/mobile-ui',
        '/inventory-list',
        '/locations',
        '/offline-inventory',
        '/online-inventory',
        '/barcode-mapping-mobile'
    ];

    if (mobileRoutes.includes(location.pathname)) {
        return null;
    }

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Database, label: 'Master Data', path: '/master-data' },
        { icon: Clock, label: 'Recent Inventory', path: '/recent-inventory' },
        { icon: ScanBarcode, label: 'Barcode Mapping', path: '/barcode-mapping' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="h-screen w-64 bg-[#5C8DBC] text-white hidden md:flex flex-col fixed left-0 top-0 z-50">
            {/* Header */}
            <div className="p-6 border-b border-white/20 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2E7D32] rounded-lg flex items-center justify-center text-white">
                    <Package size={20} />
                </div>
                <h1 className="text-2xl font-bold text-white">GST</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            twMerge(
                                clsx(
                                    'flex items-center gap-4 px-6 py-3.5 transition-all text-white relative cursor-pointer',
                                    isActive
                                        ? 'bg-[#2E7D32] border-l-4 border-white'
                                        : 'hover:bg-[#4A7BA7]'
                                )
                            )
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile */}
            <div className="p-6 border-t border-white/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2E7D32] flex items-center justify-center text-white font-semibold">
                        {user?.username?.substring(0, 2).toUpperCase() || 'JD'}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{user?.name || user?.username || 'John Doe'}</p>
                        <p className="text-xs text-white/70 capitalize">{user?.role || 'Administrator'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
