import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';
import api from '../services/api';
import { Plus, X, MapPin, RefreshCw, ChevronLeft, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../components/MobileHeader';

const PENDING_STORAGE_KEY = 'offline_pending_submissions';

interface CountItem {
    barcode: string;
    name: string;
    quantity: number;
}

interface PendingSubmission {
    id: string;
    locationId: string;
    inventoryName: string;
    inventoryDate: string;
    countedBy?: string;
    employeeId?: string;
    items: CountItem[];
    createdAt: string;
}

interface Location {
    id: string;
    name: string;
}

function getPendingSubmissions(): PendingSubmission[] {
    try {
        const raw = localStorage.getItem(PENDING_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function setPendingSubmissions(list: PendingSubmission[]) {
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(list));
}

const OfflineInventory = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();

    // --- State ---
    const [counts, setCounts] = useState<CountItem[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>('');

    // UI State
    const [inventoryName, setInventoryName] = useState('');
    const [inventoryDate, setInventoryDate] = useState('');
    const [countedBy, setCountedBy] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [isInventoryActive, setIsInventoryActive] = useState(false); // Controls if we are in "Create" vs "Active" mode

    // Input State
    const [barcodeInput, setBarcodeInput] = useState('');

    // Popups
    const [showCreatePopup, setShowCreatePopup] = useState(false);
    const [showSavePopup, setShowSavePopup] = useState(false); // "Save to Device" triggers this
    const [showFinalSubmitPopup, setShowFinalSubmitPopup] = useState(false);
    const [showQtyPopup, setShowQtyPopup] = useState(false); // For "Qty Counts" button

    // Loading/Sync State
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // --- Effects ---
    useEffect(() => {
        // Load locations
        fetchLocations();
        setPendingCount(getPendingSubmissions().length);

        // Load saved state (if any) to resume session
        const savedCounts = localStorage.getItem('offline_inventory_counts');
        const savedName = localStorage.getItem('offline_inventory_name');
        const savedDate = localStorage.getItem('offline_inventory_date');
        const savedLoc = localStorage.getItem('offline_inventory_location');
        const savedCountedBy = localStorage.getItem('offline_inventory_countedBy');
        const savedEmployeeId = localStorage.getItem('offline_inventory_employeeId');

        if (savedCounts && savedName) {
            setCounts(JSON.parse(savedCounts));
            setInventoryName(savedName);
            setInventoryDate(savedDate || new Date().toLocaleDateString());
            setSelectedLocation(savedLoc || '');
            setCountedBy(savedCountedBy || '');
            setEmployeeId(savedEmployeeId || '');
            setIsInventoryActive(true);
        }
    }, []);

    // Save state on change
    useEffect(() => {
        if (isInventoryActive) {
            localStorage.setItem('offline_inventory_counts', JSON.stringify(counts));
            localStorage.setItem('offline_inventory_name', inventoryName);
            localStorage.setItem('offline_inventory_date', inventoryDate);
            localStorage.setItem('offline_inventory_location', selectedLocation);
            localStorage.setItem('offline_inventory_countedBy', countedBy);
            localStorage.setItem('offline_inventory_employeeId', employeeId);
        }
    }, [counts, inventoryName, inventoryDate, selectedLocation, countedBy, employeeId, isInventoryActive]);

    const fetchLocations = async () => {
        try {
            // Check cache first
            const cached = localStorage.getItem('cached_locations');
            if (cached) {
                setLocations(JSON.parse(cached));
            }
            // Fetch fresh
            const response = await api.get('/mobile/locations');
            setLocations(response.data);
            localStorage.setItem('cached_locations', JSON.stringify(response.data));
        } catch (err) {
            console.error('Failed to fetch locations:', err);
        }
    };

    // --- Handlers ---

    const handleCreateInventory = () => {
        if (!inventoryName.trim()) {
            alert('Please enter an inventory name');
            return;
        }
        if (!selectedLocation) {
            alert('Please select a location');
            return;
        }

        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        setInventoryDate(dateStr);
        setIsInventoryActive(true);
        setShowCreatePopup(false);
        setCounts([]); // Reset counts for new inventory
    };

    const handleAddItem = () => {
        const code = barcodeInput.trim();
        if (!code) return;

        setCounts(prev => {
            const existing = prev.find(item => item.barcode === code);
            if (existing) {
                return prev.map(item => item.barcode === code ? { ...item, quantity: item.quantity + 1 } : item);
            } else {
                return [...prev, { barcode: code, name: `Item ${prev.length + 1}`, quantity: 1 }];
            }
        });
        setBarcodeInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddItem();
        }
    };

    const clearCurrentSession = () => {
        setCounts([]);
        setInventoryName('');
        setCountedBy('');
        setEmployeeId('');
        setIsInventoryActive(false);
        localStorage.removeItem('offline_inventory_counts');
        localStorage.removeItem('offline_inventory_name');
        localStorage.removeItem('offline_inventory_date');
        localStorage.removeItem('offline_inventory_location');
        localStorage.removeItem('offline_inventory_countedBy');
        localStorage.removeItem('offline_inventory_employeeId');
        setShowFinalSubmitPopup(false);
        setShowSavePopup(false);
    };

    const syncPendingToServer = async (): Promise<{ synced: number; failed: number }> => {
        const pending = getPendingSubmissions();
        let synced = 0;
        let failed = 0;
        const remaining: PendingSubmission[] = [];

        for (const sub of pending) {
            try {
                await api.post('/mobile/sync', {
                    locationId: sub.locationId,
                    items: sub.items,
                    status: 'offline',
                    meta: {
                        name: sub.inventoryName,
                        date: sub.inventoryDate,
                        countedBy: sub.countedBy ?? '',
                        employeeId: sub.employeeId ?? ''
                    }
                });
                synced++;
            } catch {
                remaining.push(sub);
                failed++;
            }
        }

        setPendingSubmissions(remaining);
        setPendingCount(remaining.length);
        return { synced, failed };
    };

    const handleSubmitInventory = () => {
        if (counts.length === 0) return;

        const pendingItem: PendingSubmission = {
            id: `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            locationId: selectedLocation,
            inventoryName,
            inventoryDate,
            countedBy: countedBy.trim() || undefined,
            employeeId: employeeId.trim() || undefined,
            items: [...counts],
            createdAt: new Date().toISOString()
        };

        const pending = getPendingSubmissions();
        pending.push(pendingItem);
        setPendingSubmissions(pending);
        setPendingCount(pending.length);

        clearCurrentSession();
        alert('Saved on device. Use the Sync button when online to send to admin.');
    };

    const handleSyncNow = async () => {
        const pending = getPendingSubmissions();
        if (pending.length === 0) {
            alert('No pending inventories to sync.');
            return;
        }
        setIsSyncing(true);
        try {
            const { synced, failed } = await syncPendingToServer();
            if (synced > 0) {
                alert(`${synced} inventory count(s) synced to admin. ${failed > 0 ? `${failed} failed.` : ''}`);
            } else if (failed > 0) {
                alert('Sync failed. Check your connection and try again.');
            }
        } catch {
            alert('Sync failed. Check your connection and try again.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCancelInventory = () => {
        if (confirm("Are you sure you want to exit? Unsaved progress will be lost.")) {
            setCounts([]);
            setInventoryName('');
            setCountedBy('');
            setEmployeeId('');
            setIsInventoryActive(false);
            localStorage.removeItem('offline_inventory_counts');
            localStorage.removeItem('offline_inventory_name');
            localStorage.removeItem('offline_inventory_date');
            localStorage.removeItem('offline_inventory_location');
            localStorage.removeItem('offline_inventory_countedBy');
            localStorage.removeItem('offline_inventory_employeeId');
            navigate('/mobile-ui');
        }
    };

    // --- Render Helpers ---

    const content = (
        <div className="flex flex-col h-full w-full max-w-[430px] sm:max-w-[400px] md:max-w-[430px] lg:max-w-[480px] mx-auto bg-white shadow-[0_10px_20px_-5px_rgba(9,30,66,0.25)] font-sans text-[#172B4D] overflow-hidden rounded-lg">
            {/* Header - in-app bar (hidden on desktop when we use layout header) */}
            <header className="bg-[#0052CC] text-white p-3 sm:p-4 text-center shrink-0 shadow-sm flex items-center justify-between z-10">
                {isInventoryActive ? (
                    <button onClick={handleCancelInventory} className="p-1 text-white hover:text-gray-200 rounded-lg hover:bg-white/10 transition-colors min-w-[40px] flex justify-center">
                        <ChevronLeft size={24} />
                    </button>
                ) : (
                    <button onClick={() => navigate('/mobile-ui')} className="p-1 text-white hover:text-gray-200 rounded-lg hover:bg-white/10 transition-colors min-w-[40px] flex justify-center">
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h1 className="text-base sm:text-lg font-semibold tracking-wide mx-auto truncate px-2">Offline Physical Count</h1>
                <div className="w-10 sm:w-6 min-w-[40px]" aria-hidden />
            </header>

            {/* Main Content - same layout as Online Inventory */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 sm:gap-6 min-h-0">

                {!isInventoryActive ? (
                    <div className="flex flex-col gap-3">
                        {pendingCount > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1">
                                    <p className="font-semibold text-amber-800">{pendingCount} saved on device</p>
                                    <p className="text-xs text-amber-700 mt-0.5">Sync when online to show in admin</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSyncNow}
                                    disabled={isSyncing}
                                    className="inline-flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 shrink-0"
                                >
                                    {isSyncing ? <RefreshCw size={18} className="animate-spin shrink-0" /> : <RefreshCw size={18} className="shrink-0" />}
                                    {isSyncing ? 'Syncing...' : 'Sync now'}
                                </button>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setShowCreatePopup(true)}
                            className="inline-flex items-center justify-center gap-2 font-semibold text-center whitespace-nowrap select-none border-0 py-3 px-4 sm:px-5 text-sm sm:text-base rounded-md cursor-pointer transition-all w-full text-white bg-[#0052CC] hover:bg-[#0747A6] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                        >
                            <Plus size={18} className="shrink-0" />
                            Create Inventory
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Info Card */}
                        <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg p-4 sm:p-5 text-center shadow-sm shrink-0">
                            <h2 className="text-lg sm:text-xl font-semibold text-[#172B4D] mb-1 truncate">{inventoryName}</h2>
                            <p className="text-xs sm:text-sm text-[#5E6C84]">{inventoryDate}</p>
                            <p className="text-xs text-[#5E6C84] mt-1 flex items-center justify-center gap-1 flex-wrap">
                                <MapPin size={12} className="shrink-0" /> <span className="truncate max-w-[200px] sm:max-w-none">{locations.find(l => l.id === selectedLocation)?.name || 'Unknown Location'}</span>
                            </p>
                        </div>

                        {/* Scanning Section */}
                        <section className="shrink-0">
                            <div className="mb-3 sm:mb-4">
                                <input
                                    type="text"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="block w-full p-2.5 sm:p-3 text-sm sm:text-base text-[#172B4D] bg-white border-2 border-[#DFE1E6] rounded-md focus:border-[#0052CC] focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-[#0052CC]/20 transition-all"
                                    placeholder="Enter or scan barcode..."
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={handleAddItem}
                                className="w-full bg-[#36B37E] text-white py-2.5 sm:py-3 px-4 sm:px-5 rounded-md font-semibold text-sm sm:text-base shadow-sm hover:bg-[#2F9F6D] active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} className="shrink-0" />
                                Add Item
                            </button>
                        </section>

                        {/* Data Grid Section - responsive table with horizontal scroll on small screens */}
                        <section className="flex-grow flex flex-col min-h-0 min-w-0 border border-[#DFE1E6] rounded-lg shadow-sm bg-white overflow-hidden">
                            <div className="overflow-auto flex-grow min-h-0 min-w-0">
                                <table className="w-full border-collapse text-left min-w-[280px]">
                                    <thead className="bg-[#FAFBFC] sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="p-2 sm:p-3.5 font-semibold text-[#5E6C84] text-xs sm:text-sm uppercase tracking-wider border-b border-[#DFE1E6]">Item Name</th>
                                            <th className="p-2 sm:p-3.5 font-semibold text-[#5E6C84] text-xs sm:text-sm uppercase tracking-wider border-b border-[#DFE1E6]">Barcode</th>
                                            <th className="p-2 sm:p-3.5 font-semibold text-[#5E6C84] text-xs sm:text-sm uppercase tracking-wider border-b border-[#DFE1E6] w-14 sm:w-20">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#DFE1E6]">
                                        {counts.map((item, idx) => (
                                            <tr key={idx} className="even:bg-[#FAFBFC] hover:bg-[#F0F3F8] transition-colors">
                                                <td className="p-2 sm:p-3.5 text-[#172B4D] text-sm sm:text-base min-w-0 max-w-[120px] sm:max-w-none truncate" title={item.name}>{item.name}</td>
                                                <td className="p-2 sm:p-3.5 text-[#172B4D] font-mono text-xs sm:text-sm min-w-0 max-w-[100px] sm:max-w-none truncate" title={item.barcode}>{item.barcode}</td>
                                                <td className="p-2 sm:p-3.5 text-[#172B4D] font-bold text-sm sm:text-base">{item.quantity}</td>
                                            </tr>
                                        ))}
                                        {counts.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="p-6 sm:p-8 text-center text-gray-400 text-sm sm:text-base">
                                                    No items scanned yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </main>

            {/* Action Bar (Footer) - responsive padding and text */}
            {isInventoryActive && (
                <footer className="flex justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-white border-t border-[#DFE1E6] shrink-0 shadow-[0_-2px_4px_rgba(9,30,66,0.1)]">
                    <button
                        onClick={() => setShowQtyPopup(true)}
                        className="flex-1 min-w-0 bg-[#F4F5F7] text-[#172B4D] border border-[#DFE1E6] py-2.5 sm:py-3 px-3 sm:px-5 rounded-md font-semibold text-sm sm:text-base hover:bg-[#DFE1E6] transition-all relative"
                    >
                        <span className="truncate block">Qty Counts</span>
                        <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-[#DE350B] text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center shadow-sm">
                            {counts.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setShowSavePopup(true)}
                        className="flex-1 min-w-0 bg-[#36B37E] text-white py-2.5 sm:py-3 px-3 sm:px-5 rounded-md font-semibold text-sm sm:text-base shadow-sm hover:bg-[#2F9F6D] active:translate-y-[1px] transition-all"
                    >
                        Submit
                    </button>
                </footer>
            )}

            {/* --- Popups --- */}

            {/* Create Inventory Popup - responsive width */}
            {showCreatePopup && (
                <div className="fixed inset-0 bg-[#091E42]/50 flex items-center justify-center z-50 p-3 sm:p-4 transition-opacity">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-sm md:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[#DFE1E6]">
                            <h3 className="text-xl font-semibold text-[#172B4D]">Create New Inventory</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#5E6C84] mb-1">Inventory Name</label>
                                <input
                                    type="text"
                                    value={inventoryName}
                                    onChange={(e) => setInventoryName(e.target.value)}
                                    className="block w-full p-2.5 text-[#172B4D] bg-white border-2 border-[#DFE1E6] rounded-md focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20"
                                    placeholder="e.g., Warehouse A - Zone 1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#5E6C84] mb-1">Location</label>
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="block w-full p-2.5 text-[#172B4D] bg-white border-2 border-[#DFE1E6] rounded-md focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20"
                                >
                                    <option value="">-- Select Location --</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#5E6C84] mb-1">Counted By</label>
                                <input
                                    type="text"
                                    value={countedBy}
                                    onChange={(e) => setCountedBy(e.target.value)}
                                    className="block w-full p-2.5 text-[#172B4D] bg-white border-2 border-[#DFE1E6] rounded-md focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20"
                                    placeholder="e.g., Jane Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#5E6C84] mb-1">Employee ID</label>
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    className="block w-full p-2.5 text-[#172B4D] bg-white border-2 border-[#DFE1E6] rounded-md focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20"
                                    placeholder="e.g., EMP-101"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-[#F4F5F7] flex gap-3 justify-end rounded-b-lg">
                            <button
                                onClick={() => setShowCreatePopup(false)}
                                className="flex-1 bg-white text-[#172B4D] border border-[#DFE1E6] py-2 px-4 rounded-md font-semibold hover:bg-[#DFE1E6] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateInventory}
                                className="flex-1 bg-[#0052CC] text-white py-2 px-4 rounded-md font-semibold hover:bg-[#0747A6] transition-all"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Save to Device (First Submit Step) */}
            {showSavePopup && (
                <div className="fixed inset-0 bg-[#091E42]/50 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-sm md:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[#DFE1E6]">
                            <h3 className="text-xl font-semibold text-[#172B4D]">Save Inventory</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-[#172B4D]">This will save the inventory on your device first. When you have connection, use &quot;Sync now&quot; to send it to admin. Proceed?</p>
                        </div>
                        <div className="p-4 bg-[#F4F5F7] flex gap-3 justify-end rounded-b-lg">
                            <button
                                onClick={() => setShowSavePopup(false)}
                                className="flex-1 bg-white text-[#172B4D] border border-[#DFE1E6] py-2 px-4 rounded-md font-semibold hover:bg-[#DFE1E6] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowSavePopup(false);
                                    setShowFinalSubmitPopup(true);
                                }}
                                className="flex-1 bg-[#0052CC] text-white py-2 px-4 rounded-md font-semibold hover:bg-[#0747A6] transition-all"
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Final Confirmation Popup */}
            {showFinalSubmitPopup && (
                <div className="fixed inset-0 bg-[#091E42]/50 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-sm md:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[#DFE1E6]">
                            <h3 className="text-xl font-semibold text-[#172B4D]">Confirm Submission</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-[#172B4D]">Are you sure you want to finalize and submit this inventory? This action cannot be undone.</p>
                        </div>
                        <div className="p-4 bg-[#F4F5F7] flex gap-3 justify-end rounded-b-lg">
                            <button
                                onClick={() => setShowFinalSubmitPopup(false)}
                                className="flex-1 bg-white text-[#172B4D] border border-[#DFE1E6] py-2 px-4 rounded-md font-semibold hover:bg-[#DFE1E6] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitInventory}
                                disabled={isSyncing}
                                className="flex-1 bg-[#36B37E] text-white py-2 px-4 rounded-md font-semibold hover:bg-[#2F9F6D] transition-all flex items-center justify-center gap-2"
                            >
                                {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : null}
                                {isSyncing ? 'Sending...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Qty Counts / Stats Popup */}
            {showQtyPopup && (
                <div className="fixed inset-0 bg-[#091E42]/50 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-sm md:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[#DFE1E6] flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-[#172B4D]">Inventory Stats</h3>
                            {/* Replaced 'X' from lucide with button click handling */}
                            <button onClick={() => setShowQtyPopup(false)} className="text-[#5E6C84] hover:text-[#172B4D]">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-100">
                                    <p className="text-xs uppercase font-bold text-blue-600 mb-1">Unique Items</p>
                                    <p className="text-3xl font-bold text-[#0052CC]">{counts.length}</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg text-center border border-purple-100">
                                    <p className="text-xs uppercase font-bold text-purple-600 mb-1">Total Qty</p>
                                    <p className="text-3xl font-bold text-purple-700">
                                        {counts.reduce((sum, item) => sum + item.quantity, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-[#F4F5F7] flex justify-end rounded-b-lg">
                            <button
                                onClick={() => setShowQtyPopup(false)}
                                className="bg-[#0052CC] text-white py-2 px-6 rounded-md font-semibold hover:bg-[#0747A6] transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );

    return (
        <div className="min-h-screen bg-[#F4F5F7] overflow-x-hidden">
            {isMobile ? (
                <>
                    <div className="sticky top-0 z-10">
                        <MobileHeader title="Offline Physical Count" showBack onBackClick={() => navigate('/mobile-ui')} />
                    </div>
                    <div className="h-[calc(100vh-56px)] flex flex-col overflow-auto">
                        <div className="flex-1 min-h-0 flex flex-col p-2 sm:p-4">
                            {content}
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-4 md:p-6 flex justify-center items-start min-h-screen">
                    <div className="w-full max-w-[480px] h-[90vh] min-h-[500px] max-h-[900px] overflow-hidden rounded-lg border border-[#DFE1E6] bg-[#F4F5F7] shadow-lg flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#DFE1E6] rounded-t-lg">
                            <h1 className="text-lg font-semibold text-gray-800">Offline Physical Count</h1>
                            <button
                                type="button"
                                onClick={() => navigate('/mobile-ui')}
                                className="flex items-center gap-2 text-[#0052CC] hover:text-[#0747A6] font-medium text-sm"
                            >
                                <ArrowLeft size={18} />
                                Back to Mobile UI
                            </button>
                        </div>
                        <div className="flex-1 min-h-0 overflow-hidden rounded-b-lg">
                            {content}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfflineInventory;
