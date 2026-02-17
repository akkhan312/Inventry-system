import { Smartphone, Package, MapPin, WifiOff, List, Scan } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';

interface MobileFeature {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    route: string;
    color: string;
    bgColor: string;
    borderColor: string;
    available: boolean;
}

const MobileUI = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    const features: MobileFeature[] = [
        {
            id: '1',
            title: 'Inventory List',
            description: 'View and sync all submitted inventories with online/offline status',
            icon: List,
            route: '/inventory-list',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            available: true
        },
        {
            id: '2',
            title: 'Locations Manager',
            description: 'Manage warehouse locations, stores, and distribution centers',
            icon: MapPin,
            route: '/locations',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            available: true
        },
        {
            id: '3',
            title: 'Offline Inventory',
            description: 'Count physical inventory offline with localStorage persistence',
            icon: WifiOff,
            route: '/offline-inventory',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            available: true
        },
        {
            id: '4',
            title: 'Online Inventory',
            description: 'Real-time inventory management with cloud sync',
            icon: Package,
            route: '/online-inventory',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            available: true
        },
        {
            id: '5',
            title: 'Barcode Mapping',
            description: 'Map and manage product barcodes for quick scanning',
            icon: Scan,
            route: '/barcode-mapping-mobile',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200',
            available: true
        }
    ];

    const handleFeatureClick = (feature: MobileFeature) => {
        if (feature.available) {
            navigate(feature.route);
        }
    };

    return (
        <div className={`min-h-screen ${isMobile ? 'pb-20' : ''}`}>
            {isMobile && <MobileHeader title="Mobile UI" showBack={true} />}

            <div className={`max-w-6xl mx-auto ${isMobile ? 'px-4 pt-4' : 'p-8'}`}>
                {/* Header */}
                {!isMobile && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 Mobile UI Features</h1>
                        <p className="text-gray-600">Access all mobile inventory management tools</p>
                    </div>
                )}

                {/* Mobile Hero Card (only on mobile) */}
                {isMobile && (
                    <div className="mb-6 p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <Smartphone size={32} />
                            <h2 className="text-2xl font-bold">Mobile Tools</h2>
                        </div>
                        <p className="text-blue-100">Optimized inventory management for mobile devices</p>
                    </div>
                )}

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            onClick={() => handleFeatureClick(feature)}
                            className={`
                                relative p-6 rounded-xl border-2 shadow-sm transition-all
                                ${feature.available ? 'cursor-pointer hover:shadow-lg hover:scale-105' : 'opacity-60 cursor-not-allowed'}
                                ${feature.bgColor} ${feature.borderColor}
                            `}
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-4 border ${feature.borderColor}`}>
                                <feature.icon size={28} />
                            </div>

                            {/* Title & Description */}
                            <h3 className={`text-lg font-bold mb-2 ${feature.color}`}>
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {feature.description}
                            </p>

                            {/* Status Badge */}
                            {!feature.available && (
                                <span className="absolute top-4 right-4 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                    Coming Soon
                                </span>
                            )}

                            {/* Arrow */}
                            {feature.available && (
                                <div className={`flex items-center gap-2 ${feature.color} font-semibold text-sm`}>
                                    Open
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Info Section */}
                <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">ℹ️ About Mobile UI</h3>
                    <p className="text-sm text-gray-600">
                        These mobile-optimized tools are designed for warehouse workers and inventory managers on the go.
                        Features include offline support, barcode scanning, and real-time synchronization.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MobileUI;
