import { Package, MapPin, WifiOff, List, Scan } from 'lucide-react';
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
    gradient: string;
    available: boolean;
}

const MobileUI = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    const features: MobileFeature[] = [
        {
            id: '1',
            title: 'Inventory List',
            description: 'View and sync detailed inventory records',
            icon: List,
            route: '/inventory-list',
            color: 'text-blue-100',
            gradient: 'from-blue-500 to-blue-700',
            available: true
        },
        {
            id: '2',
            title: 'Locations',
            description: 'Manage warehouse locations & stores',
            icon: MapPin,
            route: '/locations',
            color: 'text-emerald-100',
            gradient: 'from-emerald-500 to-emerald-700',
            available: true
        },
        {
            id: '3',
            title: 'Offline Mode',
            description: 'Count stock without internet connection',
            icon: WifiOff,
            route: '/offline-inventory',
            color: 'text-purple-100',
            gradient: 'from-purple-500 to-purple-700',
            available: true
        },
        {
            id: '4',
            title: 'Online Inventory',
            description: 'Real-time cloud inventory management',
            icon: Package,
            route: '/online-inventory',
            color: 'text-orange-100',
            gradient: 'from-orange-500 to-orange-700',
            available: true
        },
        {
            id: '5',
            title: 'Barcode Mapping',
            description: 'Link products to barcodes quickly',
            icon: Scan,
            route: '/barcode-mapping-mobile',
            color: 'text-indigo-100',
            gradient: 'from-indigo-500 to-indigo-700',
            available: true
        }
    ];

    const handleFeatureClick = (feature: MobileFeature) => {
        if (feature.available) {
            navigate(feature.route);
        }
    };

    return (
        <div className={`min-h-screen bg-neutral-900 text-white ${isMobile ? 'pb-24' : ''}`}>
            {isMobile && <MobileHeader title="Mobile Dashboard" showBack={false} />}

            <div className={`max-w-2xl mx-auto ${isMobile ? 'px-4 pt-6' : 'p-8'}`}>
                {/* Welcome Section */}
                <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Welcome,
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Select a tool to get started</p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            onClick={() => handleFeatureClick(feature)}
                            className={`
                                relative p-5 rounded-2xl cursor-pointer overflow-hidden group
                                bg-neutral-800/50 backdrop-blur-md border border-white/5
                                hover:border-white/10 transition-all duration-300 active:scale-[0.98]
                            `}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Hover Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                            <div className="flex items-center gap-5 relative z-10">
                                {/* Icon Box */}
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                                    <feature.icon size={26} className="text-white" />
                                </div>

                                {/* Text Content */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-lg text-white group-hover:text-blue-200 transition-colors">
                                            {feature.title}
                                        </h3>
                                        {!feature.available && (
                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase rounded-full">
                                                Soon
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-sm leading-tight group-hover:text-slate-300 transition-colors">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-white/10 group-hover:text-white transition-all">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MobileUI;
