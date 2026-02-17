import { useState, useEffect } from 'react';
import MobileHeader from '../components/MobileHeader';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import { Plus, X, MapPin, RefreshCw, ChevronLeft, ArrowLeft } from 'lucide-react';

interface CountItem {
  barcode: string;
  name: string;
  quantity: number;
}

interface Location {
  id: string;
  name: string;
  address?: string;
  type?: string;
}

interface MasterProduct {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
}

const OnlineInventory = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);
  const [inventoryName, setInventoryName] = useState('');
  const [inventoryDate, setInventoryDate] = useState('');
  const [isInventoryActive, setIsInventoryActive] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [counts, setCounts] = useState<CountItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Missing State Variables
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState('');
  const [countedBy, setCountedBy] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [nameInputError, setNameInputError] = useState(false);

  // Master Data & Unknown Barcode
  const [masterProducts, setMasterProducts] = useState<MasterProduct[]>([]);
  const [showUnknownPopup, setShowUnknownPopup] = useState(false);
  const [unknownBarcode, setUnknownBarcode] = useState('');
  const [showQtyPopup, setShowQtyPopup] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data } = await api.get<Location[]>('/mobile/locations');
        setLocations(data);
        if (data.length > 0 && !locationId) setLocationId(data[0].id);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
        const cached = localStorage.getItem('cached_locations');
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as Location[];
            setLocations(parsed);
            if (parsed.length > 0 && !locationId) setLocationId(parsed[0].id);
          } catch (_) { }
        }
      }
    };

    const fetchMasterProducts = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem('cached_master_products');
        if (cached) {
          setMasterProducts(JSON.parse(cached));
        }
        // Fetch fresh
        const response = await api.get('/inventory');
        setMasterProducts(response.data);
        localStorage.setItem('cached_master_products', JSON.stringify(response.data));
      } catch (err) {
        console.error('Failed to fetch master products:', err);
      }
    };

    fetchLocations();
    fetchMasterProducts();

    // Recover session
    const savedCounts = localStorage.getItem('online_inv_counts');
    const savedName = localStorage.getItem('online_inv_name');
    const savedDate = localStorage.getItem('online_inv_date');
    const savedLoc = localStorage.getItem('online_inv_loc');

    if (savedCounts && savedName) {
      setCounts(JSON.parse(savedCounts));
      setInventoryName(savedName);
      setInventoryDate(savedDate || new Date().toLocaleDateString());
      if (savedLoc) setLocationId(savedLoc);
      setIsInventoryActive(true);
      // Removed setScannedItemCount as we derive it now
    }
  }, []);

  // Persistence Effect
  useEffect(() => {
    if (isInventoryActive) {
      localStorage.setItem('online_inv_counts', JSON.stringify(counts));
      localStorage.setItem('online_inv_name', inventoryName);
      localStorage.setItem('online_inv_date', inventoryDate);
      localStorage.setItem('online_inv_loc', locationId);
    } else {
      // Clear if not active (successfully submitted or cancelled)
      // Check if we just submitted/cancelled
    }
  }, [counts, inventoryName, inventoryDate, locationId, isInventoryActive]);

  useEffect(() => {
    if (locations.length > 0 && !locationId) setLocationId(locations[0].id);
  }, [locations]);

  useEffect(() => {
    if (locations.length > 0) localStorage.setItem('cached_locations', JSON.stringify(locations));
  }, [locations]);

  const showPopup = (setter: (v: boolean) => void) => setter(true);
  const hidePopup = (setter: (v: boolean) => void) => setter(false);

  const saveInventory = () => {
    const name = inventoryName.trim();
    if (!name) {
      setNameInputError(true);
      return;
    }
    if (!locationId) {
      alert('Please select a location.');
      return;
    }
    setInventoryDate(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    );
    setIsInventoryActive(true);
    setShowCreatePopup(false);
    setNameInputError(false);
    setShowCreatePopup(false);
    setNameInputError(false);
  };

  const handleBack = () => {
    if (isInventoryActive) {
      if (confirm("Are you sure you want to exit? Unsaved progress will be lost.")) {
        clearLocalSession();
      }
    } else {
      navigate('/mobile-ui');
    }
  };

  const handleAddItem = () => {
    const code = barcodeInput.trim();
    if (!code) return;

    // 1. Check if already in current list -> Increment
    const existingInCounts = counts.find(r => r.barcode === code);
    if (existingInCounts) {
      setCounts(prev => prev.map(item => item.barcode === code ? { ...item, quantity: item.quantity + 1 } : item));
      setBarcodeInput('');
      return;
    }

    // 2. Lookup in Master Data
    const masterItem = masterProducts.find(p => p.sku === code || p.barcode === code);

    if (masterItem) {
      setCounts(prev => [
        ...prev,
        { name: masterItem.name, barcode: code, quantity: 1 },
      ]);
      setBarcodeInput('');
    } else {
      // 3. Not found -> Popup
      setUnknownBarcode(code);
      setShowUnknownPopup(true);
    }
  };

  const handleUnknownProductChoice = (shouldAdd: boolean) => {
    if (shouldAdd) {
      const name = prompt("Enter product name:", "New Item");
      if (name) {
        setCounts(prev => [
          ...prev,
          { name: name, barcode: unknownBarcode, quantity: 1 }
        ]);
      }
    }
    setUnknownBarcode('');
    setBarcodeInput('');
    setShowUnknownPopup(false);
  };

  const clearLocalSession = () => {
    setCounts([]);
    setInventoryName('');
    setIsInventoryActive(false);
    setLocationId('');
    setCountedBy('');
    setEmployeeId('');

    localStorage.removeItem('online_inv_counts');
    localStorage.removeItem('online_inv_name');
    localStorage.removeItem('online_inv_date');
    localStorage.removeItem('online_inv_loc');
    navigate('/mobile-ui');
  };

  const submitInventory = async () => {
    if (counts.length === 0) {
      alert('The inventory list is empty. Nothing to submit.');
      setShowSubmitPopup(false);
      return;
    }
    if (!locationId) {
      alert('No location selected. Please create an inventory with a location first.');
      setShowSubmitPopup(false);
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/mobile/sync', {
        locationId,
        items: counts.map((r) => ({
          barcode: r.barcode,
          name: r.name,
          quantity: r.quantity,
        })),
        status: 'online',
        meta: {
          name: inventoryName,
          date: inventoryDate,
          countedBy: (countedBy && countedBy.trim()) || '',
          employeeId: (employeeId && employeeId.trim()) || '',
        },
      });
      alert('Inventory successfully submitted!');
      hidePopup(setShowSubmitPopup);
      clearLocalSession();
    } catch (err: unknown) {
      console.error('Sync failed:', err);
      alert('Submit failed. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueItemCount = counts.length;

  const content = (
    <div className="flex flex-col h-full w-full max-w-[430px] sm:max-w-[400px] md:max-w-[430px] lg:max-w-[480px] mx-auto bg-white shadow-[0_10px_20px_-5px_rgba(9,30,66,0.25)] font-sans text-[#172B4D] overflow-hidden rounded-lg">
      {/* Header */}
      <header className="bg-[#0052CC] text-white p-3 sm:p-4 text-center shrink-0 shadow-sm flex items-center justify-between z-10">
        <button onClick={handleBack} className="p-1 text-white hover:text-gray-200 rounded-lg hover:bg-white/10 transition-colors min-w-[40px] flex justify-center">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base sm:text-lg font-semibold tracking-wide mx-auto truncate px-2">Online Physical Count</h1>
        <div className="w-10 sm:w-6 min-w-[40px]" aria-hidden />
      </header>

      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4 sm:gap-6 min-h-0">
        {/* Create Inventory button - only when no active inventory */}
        {!isInventoryActive && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => showPopup(setShowCreatePopup)}
              className="inline-flex items-center justify-center gap-2 font-semibold text-center whitespace-nowrap select-none border-0 py-3 px-4 sm:px-5 text-sm sm:text-base rounded-md cursor-pointer transition-all w-full text-white bg-[#0052CC] hover:bg-[#0747A6] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              <Plus size={18} className="shrink-0" />
              Create Inventory
            </button>
          </div>
        )}

        {/* Inventory info card - when active */}
        {isInventoryActive && (
          <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg p-4 sm:p-5 text-center shadow-sm shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-[#172B4D] mb-1 truncate">{inventoryName || 'Inventory'}</h2>
            <p className="text-xs sm:text-sm text-[#5E6C84]">{inventoryDate}</p>
            <p className="text-xs text-[#5E6C84] mt-1 flex items-center justify-center gap-1 flex-wrap">
              <MapPin size={12} className="shrink-0" /> <span className="truncate max-w-[200px] sm:max-w-none">{locations.find(l => l.id === locationId)?.name || 'Unknown Location'}</span>
            </p>
          </div>
        )}

        {/* Scanning section - when active */}
        {isInventoryActive && (
          <section className="shrink-0">
            <div className="mb-3 sm:mb-4">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                className="block w-full p-2.5 sm:p-3 text-sm sm:text-base text-[#172B4D] bg-white border-2 border-[#DFE1E6] rounded-md focus:border-[#0052CC] focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-[#0052CC]/20 transition-all"
                placeholder="Enter or scan barcode..."
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full bg-[#36B37E] text-white py-2.5 sm:py-3 px-4 sm:px-5 rounded-md font-semibold text-sm sm:text-base shadow-sm hover:bg-[#2F9F6D] active:translate-y-[1px] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} className="shrink-0" />
              Add Item
            </button>
          </section>
        )}

        {/* Data grid - when active */}
        {isInventoryActive && (
          <section className="flex-grow flex flex-col min-h-0 min-w-0 border border-[#DFE1E6] rounded-lg shadow-sm bg-white overflow-hidden">
            <div className="overflow-auto flex-grow min-h-0 min-w-0">
              <table className="w-full border-collapse text-left min-w-[280px]">
                <thead className="bg-[#FAFBFC] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-2 sm:p-3.5 font-semibold text-[#5E6C84] text-xs sm:text-sm uppercase tracking-wider border-b border-[#DFE1E6]">
                      Item Name
                    </th>
                    <th className="p-2 sm:p-3.5 font-semibold text-[#5E6C84] text-xs sm:text-sm uppercase tracking-wider border-b border-[#DFE1E6]">
                      Barcode
                    </th>
                    <th className="p-2 sm:p-3.5 font-semibold text-[#5E6C84] text-xs sm:text-sm uppercase tracking-wider border-b border-[#DFE1E6] w-14 sm:w-20">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody id="inventoryListBody" className="divide-y divide-[#DFE1E6]">
                  {counts.map((row, idx) => (
                    <tr
                      key={`${row.barcode}-${idx}`}
                      className="even:bg-[#FAFBFC] hover:bg-[#F0F3F8] transition-colors"
                    >
                      <td className="p-2 sm:p-3.5 text-[#172B4D] text-sm sm:text-base min-w-0 max-w-[120px] sm:max-w-none truncate" title={row.name}>{row.name}</td>
                      <td className="p-2 sm:p-3.5 text-[#172B4D] font-mono text-xs sm:text-sm min-w-0 max-w-[100px] sm:max-w-none truncate" title={row.barcode}>{row.barcode}</td>
                      <td className="p-2 sm:p-3.5 text-[#172B4D] font-bold text-sm sm:text-base">{row.quantity}</td>
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
        )}
      </main>

      {/* Action bar - when active */}
      {isInventoryActive && (
        <footer className="flex justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-white border-t border-[#DFE1E6] shrink-0 shadow-[0_-2px_4px_rgba(9,30,66,0.1)]">
          <button
            type="button"
            onClick={() => setShowQtyPopup(true)}
            className="flex-1 min-w-0 bg-[#F4F5F7] text-[#172B4D] border border-[#DFE1E6] py-2.5 sm:py-3 px-3 sm:px-5 rounded-md font-semibold text-sm sm:text-base hover:bg-[#DFE1E6] transition-all relative"
          >
            <span className="truncate block">Qty Counts</span>
            <span
              className={`absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-[#DE350B] text-white rounded-full py-0.5 px-1.5 text-xs font-bold min-w-[22px] text-center ${counts.length === 0 ? 'hidden' : ''
                }`}
            >
              {counts.reduce((acc, r) => acc + r.quantity, 0)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => showPopup(setShowSubmitPopup)}
            className="flex-1 min-w-0 bg-[#36B37E] text-white py-2.5 sm:py-3 px-3 sm:px-5 rounded-md font-semibold text-sm sm:text-base shadow-sm hover:bg-[#2F9F6D] active:translate-y-[1px] transition-all"
          >
            Submit
          </button>
        </footer>
      )}

      {/* Popup: Create Inventory */}
      {showCreatePopup && (
        <div className="fixed inset-0 bg-[#091E42]/50 flex items-center justify-center z-50 p-3 sm:p-4 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-sm md:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#DFE1E6]">
              <h3 className="text-xl font-semibold text-[#172B4D]">Create New Inventory</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5E6C84] mb-1">Location</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="block w-full p-2.5 text-[#172B4D] bg-white border-2 border-[#DFE1E6] rounded-md focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20"
                >
                  <option value="">-- Select location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5E6C84] mb-1">Inventory Name</label>
                <input
                  type="text"
                  value={inventoryName}
                  onChange={(e) => {
                    setInventoryName(e.target.value);
                    setNameInputError(false);
                  }}
                  className={`block w-full p-2.5 text-[#172B4D] bg-white border-2 rounded-md focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20 ${nameInputError ? 'border-[#DE350B]' : 'border-[#DFE1E6]'
                    }`}
                  placeholder="Add inventory name"
                />
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
                type="button"
                onClick={() => hidePopup(setShowCreatePopup)}
                className="flex-1 bg-white text-[#172B4D] border border-[#DFE1E6] py-2 px-4 rounded-md font-semibold hover:bg-[#DFE1E6] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveInventory}
                className="flex-1 bg-[#0052CC] text-white py-2 px-4 rounded-md font-semibold hover:bg-[#0747A6] transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup: Submit Confirmation */}
      {showSubmitPopup && (
        <div className="fixed inset-0 bg-[#091E42]/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-sm md:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#DFE1E6]">
              <h3 className="text-xl font-semibold text-[#172B4D]">Confirm Submission</h3>
            </div>
            <div className="p-6">
              <p className="text-[#172B4D]">Are you sure you want to submit this inventory?</p>
            </div>
            <div className="p-4 bg-[#F4F5F7] flex gap-3 justify-end rounded-b-lg">
              <button
                type="button"
                onClick={() => hidePopup(setShowSubmitPopup)}
                disabled={isSubmitting}
                className="flex-1 bg-white text-[#172B4D] border border-[#DFE1E6] py-2 px-4 rounded-md font-semibold hover:bg-[#DFE1E6] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitInventory}
                disabled={isSubmitting}
                className="flex-1 bg-[#36B37E] text-white py-2 px-4 rounded-md font-semibold hover:bg-[#2F9F6D] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : null}
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup: Unknown Product */}
      {showUnknownPopup && (
        <div className="fixed inset-0 bg-[#091E42]/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-sm md:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#DFE1E6]">
              <h3 className="text-xl font-semibold text-[#172B4D]">Product Not Found</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[#172B4D]">Barcode <strong>{unknownBarcode}</strong> was not found in the master data.</p>
              <p className="text-[#172B4D]">Do you want to add this product?</p>
            </div>
            <div className="p-4 bg-[#F4F5F7] flex gap-3 justify-end rounded-b-lg">
              <button
                type="button"
                onClick={() => handleUnknownProductChoice(false)}
                className="flex-1 bg-white text-[#172B4D] border border-[#DFE1E6] py-2 px-4 rounded-md font-semibold hover:bg-[#DFE1E6] transition-all"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => handleUnknownProductChoice(true)}
                className="flex-1 bg-[#0052CC] text-white py-2 px-4 rounded-md font-semibold hover:bg-[#0747A6] transition-all"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup: Qty Stats */}
      {showQtyPopup && (
        <div className="fixed inset-0 bg-[#091E42]/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-sm md:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#DFE1E6] flex justify-between items-center">
              <h3 className="text-xl font-semibold text-[#172B4D]">Inventory Stats</h3>
              <button onClick={() => setShowQtyPopup(false)} className="text-[#5E6C84] hover:text-[#172B4D]">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-100">
                  <p className="text-xs uppercase font-bold text-blue-600 mb-1">Unique Items</p>
                  <p className="text-3xl font-bold text-[#0052CC]">{uniqueItemCount}</p>
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
            <MobileHeader title="Online Physical Count" showBack onBackClick={handleBack} />
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
              <h1 className="text-lg font-semibold text-gray-800">Online Physical Count</h1>
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

export default OnlineInventory;
