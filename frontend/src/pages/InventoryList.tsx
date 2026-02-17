import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import { useIsMobile } from '../hooks/useMediaQuery';
import api from '../services/api';

interface InventoryItem {
    name: string;
    sku: string;
    quantity: number;
}

interface Inventory {
    id: string;
    status: 'online' | 'offline';
    submittedAt: string;
    location: {
        name: string;
    };
    items?: InventoryItem[];
}

const InventoryList = () => {
    const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        fetchInventories();
    }, []);

    const fetchInventories = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/inventory/submissions');
            setInventories(response.data);
        } catch (error) {
            console.error('Error fetching inventories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = async (inv: Inventory) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/inventory/submissions/${inv.id}`);
            setSelectedInventory(response.data);
        } catch (error) {
            console.error('Error fetching inventory details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedInventory) return;

        if (window.confirm(`Delete this submission from ${selectedHistoryName()}?`)) {
            setIsDeleting(true);
            try {
                await api.delete(`/inventory/submissions/${selectedInventory.id}`);
                setInventories(prev => prev.filter(h => h.id !== selectedInventory.id));
                setSelectedInventory(null);
            } catch (error) {
                console.error("Error deleting submission:", error);
                alert("Failed to delete submission.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const selectedHistoryName = () => selectedInventory?.location?.name || "Inventory Count";

    const handleSync = (id: string) => {
        setIsSyncing(true);
        // Simulate sync logic for offline items if they were locally stored
        // For server items, they are already online
        setTimeout(() => {
            setInventories(prev =>
                prev.map(inv => inv.id === id ? { ...inv, status: 'online' as const } : inv)
            );
            setIsSyncing(false);
            setShowSuccessModal(true);
            if (selectedInventory?.id === id) {
                setSelectedInventory(prev => prev ? { ...prev, status: 'online' } : null);
            }
        }, 1500);
    };

    const ListView = () => (
        <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="space-y-4">
                {isLoading && (
                    <div className="text-center py-10 text-gray-400">
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                        Loading recent counts...
                    </div>
                )}
                {!isLoading && inventories.length === 0 && (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-100">
                        No recent inventory counts found.
                    </div>
                )}
                {inventories.map(inventory => (
                    <div
                        key={inventory.id}
                        onClick={() => handleRowClick(inventory)}
                        className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{inventory.location?.name || "Inventory Count"}</h3>
                            <span
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${inventory.status === 'online'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                    }`}
                            >
                                {inventory.status}
                            </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                            <Calendar size={12} className="mr-1.5" />
                            {new Date(inventory.submittedAt).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const DetailView = () => {
        if (!selectedInventory) return null;

        return (
            <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                {/* Detail Header */}
                <div className="bg-white rounded-xl p-4 shadow-md mb-4 border border-gray-100 relative">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="absolute top-4 right-4 text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? <RefreshCw className="animate-spin" size={20} /> : <Trash2 size={20} />}
                    </button>
                    <h3 className="text-lg font-semibold mb-1 pr-10">{selectedHistoryName()}</h3>
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Calendar size={12} className="mr-1.5" />
                        {new Date(selectedInventory.submittedAt).toLocaleString()}
                    </div>
                    <div className="flex justify-between items-center">
                        {selectedInventory.status === 'online' ? (
                            <div className="flex items-center text-green-600 font-bold text-sm">
                                <CheckCircle size={18} className="mr-1.5" />
                                Synced to Server
                            </div>
                        ) : (
                            <button
                                onClick={() => handleSync(selectedInventory.id)}
                                disabled={isSyncing}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSyncing ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={16} />
                                        Sync Now
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Data Grid */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="grid grid-cols-[2fr_1fr] bg-gray-50 p-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <div>Item Details</div>
                        <div className="text-right">Quantity</div>
                    </div>
                    {selectedInventory.items?.map((item, idx) => (
                        <div
                            key={idx}
                            className="grid grid-cols-[2fr_1fr] gap-4 p-3 border-b border-gray-50 last:border-0 items-center"
                        >
                            <div>
                                <div className="font-bold text-gray-800 text-sm">{item.name}</div>
                                <div className="text-[10px] font-mono text-gray-400">{item.sku}</div>
                            </div>
                            <div className="font-black text-gray-900 text-right">{item.quantity}</div>
                        </div>
                    ))}
                    {(!selectedInventory.items || selectedInventory.items.length === 0) && (
                        <div className="p-10 text-center text-gray-400 text-sm">
                            No items found in this submission.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {isMobile ? (
                <MobileHeader
                    title={selectedInventory ? 'Count Details' : 'Recent Counts'}
                    showBack={!!selectedInventory}
                    onBackClick={() => setSelectedInventory(null)}
                />
            ) : (
                <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {selectedInventory ? 'Inventory Details' : 'Recent Inventory Counts'}
                    </h1>
                </div>
            )}

            {selectedInventory ? <DetailView /> : <ListView />}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="text-green-500 mb-4">
                            <CheckCircle size={60} className="mx-auto" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Sync Successful</h3>
                        <p className="text-gray-600 mb-8">
                            Your inventory has been successfully synced to the central server.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                        >
                            Awesome!
                        </button>
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {isLoading && !selectedInventory && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-40">
                    <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
                        <Loader2 size={40} className="animate-spin text-blue-600" />
                    </div>
                </div>
            )}

            {/* Mobile Bottom Padding */}
            {isMobile && <div className="h-20" />}
        </div>
    );
};

export default InventoryList;
