import { useState, useEffect } from 'react';
import MobileHeader from '../components/MobileHeader';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import { X } from 'lucide-react';

interface ScannedRow {
  itemName: string;
  barcode: string;
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
  const [rows, setRows] = useState<ScannedRow[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [scannedItemCount, setScannedItemCount] = useState(0);
  const [nameInputError, setNameInputError] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState<string>('');
  const [countedBy, setCountedBy] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Master Data & Unknown Barcode
  const [masterProducts, setMasterProducts] = useState<MasterProduct[]>([]);
  const [showUnknownPopup, setShowUnknownPopup] = useState(false);
  const [unknownBarcode, setUnknownBarcode] = useState('');

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
    const savedRows = localStorage.getItem('online_inv_rows');
    const savedName = localStorage.getItem('online_inv_name');
    const savedDate = localStorage.getItem('online_inv_date');
    const savedLoc = localStorage.getItem('online_inv_loc');

    if (savedRows && savedName) {
      setRows(JSON.parse(savedRows));
      setInventoryName(savedName);
      setInventoryDate(savedDate || new Date().toLocaleDateString());
      if (savedLoc) setLocationId(savedLoc);
      setIsInventoryActive(true);
      const parsedRows = JSON.parse(savedRows);
      setScannedItemCount(parsedRows.length);
    }
  }, []);

  // Persistence Effect
  useEffect(() => {
    if (isInventoryActive) {
      localStorage.setItem('online_inv_rows', JSON.stringify(rows));
      localStorage.setItem('online_inv_name', inventoryName);
      localStorage.setItem('online_inv_date', inventoryDate);
      localStorage.setItem('online_inv_loc', locationId);
    } else {
      // Clear if not active (successfully submitted or cancelled)
      // Check if we just submitted/cancelled
    }
  }, [rows, inventoryName, inventoryDate, locationId, isInventoryActive]);

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
  };

  const addScannedItem = () => {
    const barcode = barcodeInput.trim();
    if (!barcode) return;

    // 1. Check if already in current list -> Increment
    const existingIndex = rows.findIndex(r => r.barcode === barcode);
    if (existingIndex >= 0) {
      setRows(prev => {
        const newRows = [...prev];
        newRows[existingIndex].quantity += 1;
        return newRows;
      });
      setBarcodeInput('');
      return;
    }

    // 2. Lookup in Master Data
    const masterItem = masterProducts.find(p => p.sku === barcode || p.barcode === barcode);

    if (masterItem) {
      setRows(prev => [
        ...prev,
        { itemName: masterItem.name, barcode, quantity: 1 },
      ]);
      setScannedItemCount((c) => c + 1);
      setBarcodeInput('');
    } else {
      // 3. Not found -> Popup
      setUnknownBarcode(barcode);
      setShowUnknownPopup(true);
    }
  };

  const handleUnknownProductChoice = (shouldAdd: boolean) => {
    if (shouldAdd) {
      const name = prompt("Enter product name:", "New Item");
      if (name) {
        setRows(prev => [
          ...prev,
          { itemName: name, barcode: unknownBarcode, quantity: 1 }
        ]);
        setScannedItemCount(c => c + 1);
      }
    }
    setUnknownBarcode('');
    setBarcodeInput('');
    setShowUnknownPopup(false);
  };

  const clearLocalSession = () => {
    setRows([]);
    setItemCount(0);
    setScannedItemCount(0);
    setInventoryName('');
    setIsInventoryActive(false);
    localStorage.removeItem('online_inv_rows');
    localStorage.removeItem('online_inv_name');
    localStorage.removeItem('online_inv_date');
    localStorage.removeItem('online_inv_loc');
    navigate('/mobile-ui');
  };

  const submitInventory = async () => {
    if (rows.length === 0) {
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
        items: rows.map((r) => ({
          barcode: r.barcode,
          name: r.itemName,
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

  const uniqueItemCount = rows.length;

  const content = (
    <div className="flex flex-col h-full max-w-[430px] mx-auto bg-white shadow-[0_10px_20px_-5px_rgba(9,30,66,0.25)]">
      {/* Header */}
      <header className="bg-[#0052CC] text-white py-4 px-4 text-center flex-shrink-0 shadow-sm">
        <h1 className="text-lg font-semibold tracking-wide">Online Physical Count</h1>
      </header>

      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* Create Inventory button - only when no active inventory */}
        {!isInventoryActive && (
          <button
            type="button"
            onClick={() => showPopup(setShowCreatePopup)}
            className="inline-flex items-center justify-center gap-2 font-semibold text-center whitespace-nowrap select-none border-0 py-3 px-5 text-base rounded-md cursor-pointer transition-all w-full text-white bg-[#0052CC] hover:bg-[#0747A6] hover:-translate-y-0.5 hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
            </svg>
            Create Inventory
          </button>
        )}

        {/* Inventory info card - when active */}
        {isInventoryActive && (
          <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-lg p-5 text-center shadow-sm">
            <h2 className="text-xl text-[#172B4D] font-semibold mb-1">{inventoryName || 'Inventory'}</h2>
            <p className="text-sm text-[#5E6C84]">{inventoryDate}</p>
          </div>
        )}

        {/* Scanning section - when active */}
        {isInventoryActive && (
          <section className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addScannedItem()}
                className="block w-full py-3 px-4 text-base text-[#172B4D] bg-white border-2 border-[#DFE1E6] rounded-md focus:border-[#0052CC] focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,82,204,0.2)]"
                placeholder="Enter or scan barcode..."
              />
            </div>
            <button
              type="button"
              onClick={addScannedItem}
              className="inline-flex items-center justify-center gap-2 font-semibold text-white bg-[#36B37E] hover:bg-[#2F9F6D] py-3 px-5 rounded-md cursor-pointer transition-all w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
              </svg>
              Add Item
            </button>
          </section>
        )}

        {/* Data grid - when active */}
        {isInventoryActive && (
          <section>
            <div className="w-full border border-[#DFE1E6] rounded-lg overflow-hidden shadow-sm">
              <table className="w-full border-collapse border-spacing-0">
                <thead>
                  <tr>
                    <th className="py-3.5 px-4 text-left font-semibold text-[#5E6C84] bg-[#FAFBFC] text-sm uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="py-3.5 px-4 text-left font-semibold text-[#5E6C84] bg-[#FAFBFC] text-sm uppercase tracking-wider">
                      Barcode
                    </th>
                    <th className="py-3.5 px-4 text-left font-semibold text-[#5E6C84] bg-[#FAFBFC] text-sm uppercase tracking-wider">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody id="inventoryListBody">
                  {rows.map((row, idx) => (
                    <tr
                      key={`${row.barcode}-${idx}`}
                      className={idx % 2 === 0 ? 'bg-[#FAFBFC]' : 'bg-white'}
                    >
                      <td className="py-3.5 px-4 text-[#172B4D]">{row.itemName}</td>
                      <td className="py-3.5 px-4 text-[#172B4D]">{row.barcode}</td>
                      <td className="py-3.5 px-4 text-[#172B4D]">{row.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Action bar - when active */}
      {isInventoryActive && (
        <footer className="flex justify-between p-4 bg-white border-t border-[#DFE1E6] flex-shrink-0 shadow-[0_-2px_4px_rgba(9,30,66,0.1)]">
          <button
            type="button"
            onClick={() => alert(`Total unique items: ${uniqueItemCount}`)}
            className="flex-[0_1_48%] inline-flex items-center justify-center gap-2 font-semibold text-[#172B4D] bg-[#F4F5F7] border border-[#DFE1E6] py-3 px-5 rounded-md cursor-pointer relative"
          >
            Qty Counts
            <span
              className={`absolute -top-2 -right-2 bg-[#DE350B] text-white rounded-full py-0.5 px-1.5 text-xs font-bold min-w-[22px] text-center ${scannedItemCount === 0 ? 'hidden' : ''
                }`}
            >
              {scannedItemCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => showPopup(setShowSubmitPopup)}
            className="flex-[0_1_48%] inline-flex items-center justify-center gap-2 font-semibold text-white bg-[#36B37E] hover:bg-[#2F9F6D] py-3 px-5 rounded-md cursor-pointer"
          >
            Submit
          </button>
        </footer>
      )}

      {/* Popup: Create Inventory */}
      <div
        className={`fixed inset-0 bg-[rgba(9,30,66,0.54)] flex justify-center items-center z-[1000] transition-all duration-250 ${showCreatePopup ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        onClick={() => showCreatePopup && hidePopup(setShowCreatePopup)}
      >
        <div
          className={`bg-white rounded-lg shadow-lg w-[90%] max-w-[400px] max-h-[90vh] flex flex-col transition-transform duration-250 ${showCreatePopup ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2.5'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pt-6 px-6 pb-2 border-b border-[#DFE1E6]">
            <h3 className="text-xl font-semibold">Create New Inventory</h3>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#5E6C84] mb-1">Location</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="block w-full py-3 px-4 text-base border-2 border-[#DFE1E6] rounded-md focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,82,204,0.2)] focus:border-[#0052CC] bg-white"
              >
                <option value="">-- Select location --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#5E6C84] mb-1">Inventory name</label>
              <input
                type="text"
                value={inventoryName}
                onChange={(e) => {
                  setInventoryName(e.target.value);
                  setNameInputError(false);
                }}
                className={`block w-full py-3 px-4 text-base border-2 rounded-md focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,82,204,0.2)] ${nameInputError ? 'border-[#DE350B]' : 'border-[#DFE1E6] focus:border-[#0052CC]'
                  }`}
                placeholder="Add inventory name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#5E6C84] mb-1">Counted By</label>
              <input
                type="text"
                value={countedBy}
                onChange={(e) => setCountedBy(e.target.value)}
                className="block w-full py-3 px-4 text-base border-2 border-[#DFE1E6] rounded-md focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,82,204,0.2)] focus:border-[#0052CC] bg-white"
                placeholder="e.g., Jane Smith"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#5E6C84] mb-1">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="block w-full py-3 px-4 text-base border-2 border-[#DFE1E6] rounded-md focus:outline-none focus:ring-[3px] focus:ring-[rgba(0,82,204,0.2)] focus:border-[#0052CC] bg-white"
                placeholder="e.g., EMP-101"
              />
            </div>
          </div>
          <div className="pb-6 px-6 pt-2 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => hidePopup(setShowCreatePopup)}
              className="flex-1 font-semibold text-[#172B4D] bg-[#F4F5F7] border border-[#DFE1E6] py-3 px-5 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveInventory}
              className="flex-1 font-semibold text-white bg-[#0052CC] py-3 px-5 rounded-md cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Popup: Submit Confirmation */}
      <div
        className={`fixed inset-0 bg-[rgba(9,30,66,0.54)] flex justify-center items-center z-[1000] transition-all duration-250 ${showSubmitPopup ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        onClick={() => showSubmitPopup && hidePopup(setShowSubmitPopup)}
      >
        <div
          className={`bg-white rounded-lg shadow-lg w-[90%] max-w-[400px] max-h-[90vh] flex flex-col transition-transform duration-250 ${showSubmitPopup ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2.5'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pt-6 px-6 pb-2 border-b border-[#DFE1E6]">
            <h3 className="text-xl font-semibold">Confirm Submission</h3>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            <p>Are you sure you want to submit this inventory?</p>
          </div>
          <div className="pb-6 px-6 pt-2 flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => hidePopup(setShowSubmitPopup)}
              disabled={isSubmitting}
              className="flex-1 font-semibold text-[#172B4D] bg-[#F4F5F7] border border-[#DFE1E6] py-3 px-5 rounded-md cursor-pointer disabled:opacity-50"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={submitInventory}
              disabled={isSubmitting}
              className="flex-1 font-semibold text-white bg-[#36B37E] py-3 px-5 rounded-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Popup: Unknown Product */ }
  <div
    className={`fixed inset-0 bg-[rgba(9,30,66,0.54)] flex justify-center items-center z-[1000] transition-all duration-250 ${showUnknownPopup ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
    onClick={() => false}
  >
    <div
      className={`bg-white rounded-lg shadow-lg w-[90%] max-w-[400px] flex flex-col transition-transform duration-250 ${showUnknownPopup ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2.5'
        }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="pt-6 px-6 pb-2 border-b border-[#DFE1E6]">
        <h3 className="text-xl font-semibold">Product Not Found</h3>
      </div>
      <div className="p-6">
        <p className="mb-2">Barcode <strong>{unknownBarcode}</strong> was not found in the master data.</p>
        <p>Do you want to add this product?</p>
      </div>
      <div className="pb-6 px-6 pt-2 flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => handleUnknownProductChoice(false)}
          className="flex-1 font-semibold text-[#172B4D] bg-[#F4F5F7] border border-[#DFE1E6] py-3 px-5 rounded-md cursor-pointer"
        >
          No
        </button>
        <button
          type="button"
          onClick={() => handleUnknownProductChoice(true)}
          className="flex-1 font-semibold text-white bg-[#0052CC] py-3 px-5 rounded-md cursor-pointer"
        >
          Yes
        </button>
      </div>
    </div>
  </div>
    </div >

  return (
  <div className="min-h-screen bg-[#F4F5F7] overflow-hidden">
    {isMobile ? (
      <>
        <div className="sticky top-0 z-10">
          <MobileHeader title="Online Physical Count" showBack onBackClick={() => navigate('/mobile-ui')} />
        </div>
        <div className="h-[calc(100vh-56px)] overflow-auto">{content}</div>
      </>
    ) : (
      <div className="p-4 flex justify-center">
        <div className="h-[90vh] min-h-[600px] w-full overflow-hidden rounded-lg border border-[#DFE1E6]">
          {content}
        </div>
      </div>
    )}
  </div>
);
};

export default OnlineInventory;
