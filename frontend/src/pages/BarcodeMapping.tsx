import React, { useState, useEffect } from "react";
import { Search, FileSpreadsheet, CheckCircle, Trash2 } from "lucide-react";
import api from "../services/api";

/* =========================
   TYPES
========================= */

interface BarcodeItem {
    id: string;
    barcode: string;
    seriesNumber: string;
    item: string;
    quantity: number;
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

/* =========================
   DATA
========================= */

// Data will be fetched from API

/* =========================
   COMPONENT
========================= */

const BarcodeMapping: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [barcodeData, setBarcodeData] = useState<BarcodeItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMappings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/barcode-mapping');
            setBarcodeData(response.data);
        } catch (error) {
            console.error('Error fetching barcode mappings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMappings();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await api.patch(`/barcode-mapping/${id}/approve`);
            fetchMappings();
        } catch (error) {
            console.error('Error approving barcode mapping:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this mapping?')) return;
        try {
            await api.delete(`/barcode-mapping/${id}`);
            fetchMappings();
        } catch (error) {
            console.error('Error deleting barcode mapping:', error);
        }
    };

    const filteredData = barcodeData.filter((item: BarcodeItem) =>
        Object.values(item)
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        window.open(`${api.defaults.baseURL}/barcode-mapping/export`, '_blank');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">
                Barcode Mapping
            </h1>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:w-72">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search barcode mapping..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
                >
                    <FileSpreadsheet size={18} />
                    Export to Excel
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="min-w-[1200px] w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-center">#</th>
                            <th className="px-4 py-3 text-left">Serial No</th>
                            <th className="px-4 py-3 text-left">GTIN</th>
                            <th className="px-4 py-3 text-left">Item Name</th>
                            <th className="px-4 py-3 text-left">Config</th>
                            <th className="px-4 py-3 text-left">MFG Date</th>
                            <th className="px-4 py-3 text-left">Bin</th>
                            <th className="px-4 py-3 text-left">Ref</th>
                            <th className="px-4 py-3 text-right">L</th>
                            <th className="px-4 py-3 text-right">W</th>
                            <th className="px-4 py-3 text-right">H</th>
                            <th className="px-4 py-3 text-right">WT</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={13} className="text-center py-12">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-gray-500 font-medium">Loading mappings...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item: BarcodeItem, index: number) => (
                                <tr
                                    key={item.id}
                                    className="border-t hover:bg-gray-50 transition"
                                >
                                    <td className="px-4 py-3 text-center">{index + 1}</td>
                                    <td className="px-4 py-3">{item.seriesNumber}</td>
                                    <td className="px-4 py-3">{item.barcode}</td>
                                    <td className="px-4 py-3 font-medium">{item.item}</td>
                                    <td className="px-4 py-3">{item.config || '—'}</td>
                                    <td className="px-4 py-3">{item.manufactureDate || '—'}</td>
                                    <td className="px-4 py-3">{item.binLocation || '—'}</td>
                                    <td className="px-4 py-3">{item.reference || '—'}</td>
                                    <td className="px-4 py-3 text-right">{item.length || '0'}</td>
                                    <td className="px-4 py-3 text-right">{item.width || '0'}</td>
                                    <td className="px-4 py-3 text-right">{item.height || '0'}</td>
                                    <td className="px-4 py-3 text-right">{item.weight || '0'}</td>
                                    <td className="px-4 py-3 text-center">
                                        {item.status === 'pending' ? (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Pending</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Mapped</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {item.status === 'pending' && (
                                                <button
                                                    onClick={() => handleApprove(item.id)}
                                                    className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 cursor-pointer"
                                                    title="Approve Mapping"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 cursor-pointer"
                                                title="Delete Mapping"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={13}
                                    className="text-center py-6 text-gray-500"
                                >
                                    No matching records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default BarcodeMapping;
