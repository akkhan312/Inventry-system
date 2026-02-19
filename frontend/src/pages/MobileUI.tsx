import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Bell,
    Package,
    AlertTriangle,
    Warehouse,
    ClipboardList,
    MapPin,
    ScanBarcode,
    Globe,
    CheckSquare,
    X
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import api from '../services/api';

const MobileUI = () => {
    const navigate = useNavigate();
    const { stats, setDashboardData } = useDashboard();
    const [showInventoryModal, setShowInventoryModal] = useState(false);

    // Fetch dashboard data if not available
    useEffect(() => {
        const fetchData = async () => {
            try {
                // If stats are empty, fetch them
                if (!stats) {
                    const response = await api.get('/inventory/dashboard');
                    setDashboardData(
                        response.data.stats,
                        response.data.recentProducts,
                        response.data.stockTrendData,
                        response.data.categoryDistribution
                    );
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            }
        };

        fetchData();
    }, [stats, setDashboardData]);

    const handleInventoryClick = () => {
        setShowInventoryModal(true);
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] font-sans text-[#1C1C1E] pb-24 relative overflow-hidden">
            {/* App Bar Header */}
            <header className="bg-white px-4 py-3 flex justify-between items-center shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                    <div className="w-[30px] h-[30px] bg-[#007AFF] rounded-lg flex items-center justify-center text-white">
                        <Box size={16} />
                    </div>
                    <span className="text-[1.1rem] font-semibold text-[#1C1C1E]">GST Inventory</span>
                </div>
                <button className="text-[#007AFF] cursor-pointer active:opacity-70">
                    <Bell size={22} />
                </button>
            </header>

            <main className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* KPI Section */}
                <section className="grid grid-cols-2 gap-4 mb-6">
                    {/* Total Products Widget */}
                    <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-black/5">
                        <div className="w-11 h-11 rounded-xl bg-[#007AFF] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <Package size={20} />
                        </div>
                        <div>
                            <div className="text-[1.3rem] font-bold leading-none">{stats?.totalProducts?.toLocaleString() || "0"}</div>
                            <div className="text-[0.8rem] text-[#8E8E93] mt-0.5 font-medium">Total Products</div>
                        </div>
                    </div>

                    {/* Low Stock Widget */}
                    <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-black/5">
                        <div className="w-11 h-11 rounded-xl bg-[#FF9500] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <div className="text-[1.3rem] font-bold leading-none">{stats?.lowStockItems?.toString() || "0"}</div>
                            <div className="text-[0.8rem] text-[#8E8E93] mt-0.5 font-medium">Low Stock</div>
                        </div>
                    </div>
                </section>

                {/* Navigation Grid */}
                <section className="grid grid-cols-2 gap-4">
                    {/* Inventory Button */}
                    <button
                        onClick={handleInventoryClick}
                        className="bg-[#5856D6] border-none rounded-[18px] py-8 px-4 flex flex-col items-center justify-center gap-3 shadow-[0_6px_16px_rgba(0,0,0,0.1)] active:scale-[0.96] transition-transform duration-100"
                    >
                        <Warehouse size={40} className="text-white" />
                        <span className="text-white font-semibold text-[0.95rem]">Inventory</span>
                    </button>

                    {/* List of Stocks Button */}
                    <button
                        onClick={() => navigate('/inventory-list')}
                        className="bg-[#FF3B30] border-none rounded-[18px] py-8 px-4 flex flex-col items-center justify-center gap-3 shadow-[0_6px_16px_rgba(0,0,0,0.1)] active:scale-[0.96] transition-transform duration-100"
                    >
                        <ClipboardList size={40} className="text-white" />
                        <span className="text-white font-semibold text-[0.95rem]">List of Stocks</span>
                    </button>

                    {/* Locations Button */}
                    <button
                        onClick={() => navigate('/locations?mobile=true')}
                        className="bg-[#34C759] border-none rounded-[18px] py-8 px-4 flex flex-col items-center justify-center gap-3 shadow-[0_6px_16px_rgba(0,0,0,0.1)] active:scale-[0.96] transition-transform duration-100"
                    >
                        <MapPin size={40} className="text-white" />
                        <span className="text-white font-semibold text-[0.95rem]">Locations</span>
                    </button>

                    {/* Barcode Mapping Button */}
                    <button
                        onClick={() => navigate('/barcode-mapping-mobile')}
                        className="bg-[#FF9500] border-none rounded-[18px] py-8 px-4 flex flex-col items-center justify-center gap-3 shadow-[0_6px_16px_rgba(0,0,0,0.1)] active:scale-[0.96] transition-transform duration-100"
                    >
                        <ScanBarcode size={40} className="text-white" />
                        <span className="text-white font-semibold text-[0.95rem]">Barcode Mapping</span>
                    </button>
                </section>
            </main>

            {/* Inventory Modal Overlay */}
            {showInventoryModal && (
                <div
                    className="fixed inset-0 bg-black/40 z-[1000] flex items-end justify-center animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowInventoryModal(false);
                    }}
                >
                    <div className="bg-white rounded-t-[20px] w-full max-w-md mx-auto shadow-[0_-10px_25px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-300 overflow-hidden pb-8">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-[1.2rem] font-semibold text-[#1C1C1E]">Choose Inventory Type</h3>
                            <button
                                onClick={() => setShowInventoryModal(false)}
                                className="text-[#8E8E93] hover:text-gray-600 p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <button
                                onClick={() => navigate('/online-inventory')}
                                className="w-full p-4 rounded-[14px] bg-[#007AFF] text-white flex items-center gap-4 text-[1rem] font-semibold shadow-md active:scale-[0.98] transition-all"
                            >
                                <Globe size={24} />
                                Online Inventory
                            </button>
                            <button
                                onClick={() => navigate('/offline-inventory')}
                                className="w-full p-4 rounded-[14px] bg-[#34C759] text-white flex items-center gap-4 text-[1rem] font-semibold shadow-md active:scale-[0.98] transition-all"
                            >
                                <CheckSquare size={24} />
                                Offline Physical Count
                            </button>
                            <button
                                onClick={() => setShowInventoryModal(false)}
                                className="w-full p-4 rounded-[14px] bg-[#F2F2F7] text-[#007AFF] text-[1rem] font-semibold active:bg-gray-200 transition-colors mt-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileUI;
