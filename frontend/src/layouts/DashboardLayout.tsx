import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../hooks/useMediaQuery';

const DashboardLayout = () => {
    const isMobile = useIsMobile();
    const location = useLocation();

    // Mobile specific routes that should have a clean, headerless view even on desktop
    const mobileRoutes = [
        '/mobile-ui',
        '/inventory-list',
        '/offline-inventory',
        '/online-inventory',
        '/barcode-mapping-mobile'
    ];

    const isMobileUI = mobileRoutes.includes(location.pathname) || new URLSearchParams(location.search).get('mobile') === 'true';

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Hide sidebar on mobile OR on specific mobile UI routes */}
            {!isMobile && !isMobileUI && <Sidebar />}

            <div className={`flex-1 ${(!isMobile && !isMobileUI) ? 'ml-64' : ''}`}>
                {/* Hide header on mobile OR on specific mobile UI routes */}
                {!isMobile && !isMobileUI && <Header />}

                <main className={`${(!isMobile && !isMobileUI) ? 'p-6 mt-16' : 'pb-20'}`}>
                    <Outlet />
                </main>
            </div>

            {/* Show mobile bottom nav only on mobile */}
            <MobileBottomNav />
        </div>
    );
};

export default DashboardLayout;
