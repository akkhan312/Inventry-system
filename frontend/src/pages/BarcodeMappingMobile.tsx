import React, { useState, useEffect } from 'react';
import { Search, QrCode, Plus, Tag, Package, MapPin, Settings, Calendar, FileText, Loader2 } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import { useIsMobile } from '../hooks/useMediaQuery';
import api from '../services/api';

interface BarcodeMapping {
    id: string;
    barcode: string;
    seriesNumber: string;
    quantity: number;
    item: string;
    location: string;
    status: 'mapped' | 'pending';
    config?: string;
    manufactureDate?: string;
    binLocation?: string;
    reference?: string;
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
}

const BarcodeMappingMobile = () => {
    const isMobile = useIsMobile();
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showScanModal, setShowScanModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [barcodes, setBarcodes] = useState<BarcodeMapping[]>([]);

    const fetchMappings = async () => {
        try {
            const response = await api.get('/barcode-mapping');
            setBarcodes(response.data);
        } catch (error) {
            console.error('Error fetching mappings:', error);
        }
    };

    useEffect(() => {
        fetchMappings();
    }, []);

    const [formData, setFormData] = useState({
        barcode: '',
        config: 'CONFIG#1',
        manufactureDate: '',
        binLocation: '',
        reference: '',
        seriesNumber: '',
        quantity: 0,
        length: 0,
        width: 0,
        height: 0,
        weight: 0
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSave = async () => {
        if (!formData.barcode || !formData.seriesNumber || !formData.quantity) {
            alert('Please fill in all required fields (Barcode, Series Number, and Quantity)');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/barcode-mapping', {
                barcode: formData.barcode,
                seriesNumber: formData.seriesNumber,
                quantity: formData.quantity,
                item: 'New Item', // This would normally come from a product lookup
                location: formData.binLocation || 'Warehouse-Mobile',
                config: formData.config,
                manufactureDate: formData.manufactureDate,
                binLocation: formData.binLocation,
                reference: formData.reference,
                length: formData.length,
                width: formData.width,
                height: formData.height,
                weight: formData.weight
            });

            setBarcodes(prev => [response.data, ...prev]);
            alert('Barcode mapping saved successfully! Status: Pending Approval');
            setShowModal(false);
            // Reset form
            setFormData({
                barcode: '',
                config: 'CONFIG#1',
                manufactureDate: '',
                binLocation: '',
                reference: '',
                seriesNumber: '',
                quantity: 0,
                length: 0,
                width: 0,
                height: 0,
                weight: 0
            });
        } catch (error: any) {
            console.error('Error saving mapping:', error);
            alert(error.response?.data?.error || 'Failed to save barcode mapping');
        } finally {
            setLoading(false);
        }
    };

    const handleScan = () => {
        setShowScanModal(true);
        // Simulate scanning after 3 seconds
        setTimeout(() => {
            const randomBarcode = `BC-2023-${String(Math.floor(Math.random() * 900) + 100)}`;
            setFormData(prev => ({ ...prev, barcode: randomBarcode }));
            setShowScanModal(false);
            alert(`Barcode scanned successfully: ${randomBarcode}`);
        }, 3000);
    };

    const filteredBarcodes = barcodes.filter(barcode =>
        barcode.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        barcode.seriesNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        barcode.item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`min-h-screen bg-gray-50 ${isMobile ? 'pb-20' : ''}`}>
            {isMobile && <MobileHeader title="Barcode Mapping" showBack={true} />}

            <div className={`max-w-6xl mx-auto ${isMobile ? 'px-4 pt-4' : 'p-8'}`}>
                {/* Header */}
                {!isMobile && (
                    <div className="flex items-center mb-6">
                        <QrCode className="mr-3 text-blue-600" size={32} />
                        <h1 className="text-3xl font-bold text-gray-900">Barcode Mapping</h1>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative mb-5">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search barcodes..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Start Mapping Button */}
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full mb-5 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                    <Plus className="mr-2" size={20} />
                    Start Mapping
                </button>

                {/* Barcode List */}
                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-3">Mapped Barcodes</h2>

                    {filteredBarcodes.map((barcode) => (
                        <div key={barcode.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <div className="font-medium text-gray-900">{barcode.id}</div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${barcode.status === 'mapped'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {barcode.status === 'mapped' ? 'Mapped' : 'Pending'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <Tag size={16} className="mr-2 text-gray-400" />
                                    <span className="mr-1">Series:</span>
                                    <span className="font-medium text-gray-900">{barcode.seriesNumber}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Package size={16} className="mr-2 text-gray-400" />
                                    <span className="mr-1">Qty:</span>
                                    <span className="font-medium text-gray-900">{barcode.quantity}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Tag size={16} className="mr-2 text-gray-400" />
                                    <span className="mr-1">Item:</span>
                                    <span className="font-medium text-gray-900">{barcode.item}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <MapPin size={16} className="mr-2 text-gray-400" />
                                    <span className="mr-1">Location:</span>
                                    <span className="font-medium text-gray-900">{barcode.location}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Barcode Details Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-medium">Barcode Details</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number / Barcode</label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                    <QrCode size={18} className="text-gray-400 mr-3" />
                                    <input type="text" id="barcode" value={formData.barcode} onChange={handleInputChange} placeholder="Enter or scan barcode" className="flex-1 bg-transparent outline-none" />
                                </div>
                                <button onClick={handleScan} className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center hover:bg-blue-700">
                                    <QrCode size={16} className="mr-2" />QR Scanning
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Configuration</label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                    <Settings size={18} className="text-gray-400 mr-3" />
                                    <select id="config" value={formData.config} onChange={handleInputChange} className="flex-1 bg-transparent outline-none">
                                        <option>CONFIG#1</option>
                                        <option>CONFIG#2</option>
                                        <option>CONFIG#3</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Manufacture Date</label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                    <Calendar size={18} className="text-gray-400 mr-3" />
                                    <input type="date" id="manufactureDate" value={formData.manufactureDate} onChange={handleInputChange} className="flex-1 bg-transparent outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bin Location</label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                    <Package size={18} className="text-gray-400 mr-3" />
                                    <input type="text" id="binLocation" value={formData.binLocation} onChange={handleInputChange} placeholder="Enter bin location" className="flex-1 bg-transparent outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                    <FileText size={18} className="text-gray-400 mr-3" />
                                    <input type="text" id="reference" value={formData.reference} onChange={handleInputChange} placeholder="Enter reference" className="flex-1 bg-transparent outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Series Number</label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                    <Tag size={18} className="text-gray-400 mr-3" />
                                    <input type="text" id="seriesNumber" value={formData.seriesNumber} onChange={handleInputChange} placeholder="Enter series number" className="flex-1 bg-transparent outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                    <Package size={18} className="text-gray-400 mr-3" />
                                    <input type="number" id="quantity" value={formData.quantity || ''} onChange={handleInputChange} placeholder="Enter quantity" className="flex-1 bg-transparent outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (cm)</label>
                                    <input type="number" id="length" value={formData.length || ''} onChange={handleInputChange} placeholder="0.0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (cm)</label>
                                    <input type="number" id="width" value={formData.width || ''} onChange={handleInputChange} placeholder="0.0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                                    <input type="number" id="height" value={formData.height || ''} onChange={handleInputChange} placeholder="0.0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                                    <input type="number" id="weight" value={formData.weight || ''} onChange={handleInputChange} placeholder="0.0" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 cursor-pointer">Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scan Modal */}
            {showScanModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowScanModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-medium">Scan Barcode</h2>
                            <button onClick={() => setShowScanModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>

                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <QrCode size={48} className="text-gray-300 mb-4" />
                            <p className="text-gray-600 mb-2">Position barcode within frame</p>
                            <p className="text-sm text-gray-500">The camera will automatically detect and scan the barcode</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowScanModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
                            <button onClick={() => { setShowScanModal(false); document.getElementById('barcode')?.focus(); }} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700">Manual Input</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarcodeMappingMobile;
