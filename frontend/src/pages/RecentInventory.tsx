import React, { useState, useEffect } from "react";
import { RefreshCw, Download, Loader2, Trash2 } from "lucide-react";
import api from "../services/api";

interface InventoryHistory {
    id: string;
    status: string;
    submittedAt: string;
    name?: string | null;
    countedBy?: string | null;
    employeeId?: string | null;
    location: { name: string };
    _count?: { items: number };
}

function getCountedBy(inv: InventoryHistory): string {
    const v = inv.countedBy ?? (inv as any).counted_by;
    return v != null && String(v).trim() ? String(v).trim() : "—";
}
function getEmployeeId(inv: InventoryHistory): string {
    const v = inv.employeeId ?? (inv as any).employee_id;
    return v != null && String(v).trim() ? String(v).trim() : "—";
}

interface InventoryDetailItem {
    sku: string;
    name: string;
    expectedQuantity: number;
    quantity: number;
}

interface SubmissionDetail {
    id: string;
    submittedAt: string;
    name?: string | null;
    location: { name: string };
    items: InventoryDetailItem[];
}

const RecentInventory: React.FC = () => {
    const [history, setHistory] = useState<InventoryHistory[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<SubmissionDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<InventoryHistory[]>("/inventory/submissions");
            setHistory(response.data);
        } catch (error) {
            console.error("Error fetching inventory history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = async (inv: InventoryHistory) => {
        setSelectedId(inv.id);
        setIsDetailsLoading(true);
        setSelectedDetail(null);
        try {
            const response = await api.get<SubmissionDetail>(`/inventory/submissions/${inv.id}`);
            setSelectedDetail(response.data);
        } catch (error) {
            console.error("Error fetching submission details:", error);
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await api.delete(`/inventory/submissions/${deleteId}`);
            // Remove from local state
            setHistory(prev => prev.filter(h => h.id !== deleteId));
            if (selectedId === deleteId) {
                setSelectedId(null);
                setSelectedDetail(null);
            }
            setDeleteId(null);
        } catch (error) {
            console.error("Error deleting submission:", error);
            alert("Failed to delete inventory submission.");
        } finally {
            setIsDeleting(false);
        }
    };

    const displayInventoryName = (inv: InventoryHistory) =>
        inv.name?.trim() || `${inv.location?.name || "Inventory"} - ${new Date(inv.submittedAt).toLocaleDateString()}`;

    const detailsTitle = selectedDetail
        ? `Details for: ${selectedDetail.name?.trim() || selectedDetail.location?.name || "Inventory Count"}`
        : "Select an inventory from the list above to view details.";

    const handleExport = () => {
        if (selectedId) {
            window.open(`${api.defaults.baseURL}/reports/export/inventory/${selectedId}`, "_blank");
        }
    };

    return (
        <div className="flex flex-col flex-grow min-h-0 bg-[#F0F2F5]">
            <div className="px-6 py-5 flex flex-col gap-6 flex-grow min-h-0">
                <h1 className="text-[1.8rem] font-bold text-[#2C3E50]">Recent Inventory Counts</h1>

                {/* Upper Section: Inventory History Table */}
                <section className="flex flex-col flex-grow min-h-0 bg-white rounded-xl shadow-sm border border-[#E1E8ED] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#E1E8ED]">
                        <h3 className="text-lg font-semibold text-[#2C3E50]">Inventory History</h3>
                    </div>
                    <div className="overflow-x-auto flex-grow min-h-0">
                        <table className="w-full border-collapse min-w-[600px] text-[#2C3E50]">
                            <thead>
                                <tr>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Inventory Name
                                    </th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Location
                                    </th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Date & Time
                                    </th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Counted By
                                    </th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Employee ID
                                    </th>
                                    <th className="text-center py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap w-[60px]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-[#6C757D]">
                                            <RefreshCw size={24} className="animate-spin mx-auto mb-2 inline-block" />
                                            Loading submissions...
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-[#6C757D]">
                                            No submissions found. Start a count from mobile!
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((inv) => (
                                        <tr
                                            key={inv.id}
                                            onClick={() => handleRowClick(inv)}
                                            className={`cursor-pointer transition-colors border-b border-[#E1E8ED] hover:bg-[#f1f3f5] ${selectedId === inv.id ? "bg-[#E6F0FA] border-l-4 border-l-[#4A90E2]" : ""
                                                }`}
                                        >
                                            <td className="py-3 px-4 font-medium">{displayInventoryName(inv)}</td>
                                            <td className="py-3 px-4">{inv.location?.name || "—"}</td>
                                            <td className="py-3 px-4">{new Date(inv.submittedAt).toLocaleString()}</td>
                                            <td className="py-3 px-4">{getCountedBy(inv)}</td>
                                            <td className="py-3 px-4">{getEmployeeId(inv)}</td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, inv.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                                    title="Delete Inventory"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Lower Section: Item Details */}
                <section className="flex flex-col flex-grow min-h-0 bg-white rounded-xl shadow-sm border border-[#E1E8ED] overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-[#E1E8ED]">
                        <h3 className="text-lg font-semibold text-[#2C3E50]">{detailsTitle}</h3>
                        {selectedId && (
                            <button
                                type="button"
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 py-2 px-4 bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-semibold text-sm rounded-lg shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                            >
                                <Download size={16} /> Export List
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto flex-grow min-h-0">
                        {!selectedId ? (
                            <div className="py-12 text-center text-[#6C757D] text-base">
                                <span className="inline-block mb-4 text-3xl opacity-60">👆</span>
                                <p>Click on a row in the history table to see the item details.</p>
                            </div>
                        ) : isDetailsLoading ? (
                            <div className="py-12 text-center text-[#6C757D]">
                                <Loader2 size={24} className="animate-spin mx-auto mb-2 inline-block" />
                                Loading items...
                            </div>
                        ) : selectedDetail?.items && selectedDetail.items.length > 0 ? (
                            <table className="w-full border-collapse min-w-[600px] text-[#2C3E50]">
                                <thead>
                                    <tr>
                                        <th className="text-center py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] w-12">
                                            #
                                        </th>
                                        <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED]">
                                            Item Code
                                        </th>
                                        <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED]">
                                            Item Name
                                        </th>
                                        <th className="text-right py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED]">
                                            System Qty
                                        </th>
                                        <th className="text-right py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED]">
                                            Counted Qty
                                        </th>
                                        <th className="text-right py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED]">
                                            Variance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDetail.items.map((item, idx) => (
                                        <tr
                                            key={idx}
                                            className="border-b border-[#E1E8ED] hover:bg-[#f1f3f5] transition-colors"
                                        >
                                            <td className="py-3 px-4 text-center text-[#6C757D]">{idx + 1}</td>
                                            <td className="py-3 px-4 font-mono text-sm">{item.sku}</td>
                                            <td className="py-3 px-4 font-medium">{item.name}</td>
                                            <td className="py-3 px-4 text-right">{item.expectedQuantity}</td>
                                            <td className="py-3 px-4 text-right font-semibold">{item.quantity}</td>
                                            <td className={`py-3 px-4 text-right ${(item.quantity - item.expectedQuantity) > 0 ? "text-[#2ECC71] font-semibold" : (item.quantity - item.expectedQuantity) < 0 ? "text-[#E74C3C] font-semibold" : "text-[#6C757D]"}`}>
                                                {(item.quantity - item.expectedQuantity) > 0 ? `+${item.quantity - item.expectedQuantity}` : `${item.quantity - item.expectedQuantity}`}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-12 text-center text-[#6C757D] text-sm">
                                No items in this submission.
                            </div>
                        )}
                    </div>
                </section>
            </div>
            {/* Delete Confirmation Popup */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[#E1E8ED]">
                            <h3 className="text-xl font-semibold text-[#2C3E50]">Confirm Delete</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-[#2C3E50]">Are you sure do delete this inventory record?</p>
                            <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
                        </div>
                        <div className="p-4 bg-[#F8F9FA] flex gap-3 justify-end rounded-b-lg">
                            <button
                                onClick={() => setDeleteId(null)}
                                disabled={isDeleting}
                                className="flex-1 bg-white text-[#2C3E50] border border-[#DFE1E6] py-2 px-4 rounded-md font-semibold hover:bg-[#E1E8ED] transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentInventory;
