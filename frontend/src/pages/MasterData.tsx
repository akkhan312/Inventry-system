import { useState, useEffect, useRef } from "react";
import { Search, RefreshCw, Download, Upload, Trash2 } from "lucide-react";
import api from "../services/api";

interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    description?: string | null;
    barcode?: string | null;
    unit: string;
    quantity: number;
    purchasePrice: number;
    salePrice: number;
    hsnCode?: string | null;
    gstRate?: number;
    status: string;
    openingStock?: number;
    minStock?: number;
    reorderPoint?: number;
    location?: string;
    supplier?: string;
    batchNumber?: string;
    expiryDate?: string;
    createdAt: string;
    updatedAt: string;
}

const MasterData = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<Product[]>("/inventory");
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            try {
                await api.delete(`/inventory/${id}`);
                setProducts(products.filter(product => product.id !== id));
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product. Please try again.");
            }
        }
    };

    const handleExport = () => {
        window.open(`${api.defaults.baseURL}/reports/export/products`, "_blank");
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        setIsImporting(true);
        try {
            const response = await api.post("/inventory/import", formDataUpload, {
                transformRequest: [
                    (data: any, headers: any) => {
                        if (data instanceof FormData) {
                            delete (headers as Record<string, string>)["Content-Type"];
                        }
                        return data;
                    },
                ],
            });
            const data = response.data as { message?: string; errors?: string[] };
            if (data.errors?.length) {
                alert(`Import completed: ${data.message ?? "Done"}\n\nErrors:\n${data.errors.join("\n")}`);
            } else {
                alert(data.message ?? "Import completed successfully.");
            }
            fetchProducts();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error("Error importing products:", error);
            alert(err.response?.data?.message ?? "Failed to import products. Check file format (XLSX/XLS/CSV) and columns: Name, SKU, Category.");
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const filteredItems = products.filter((item) =>
        Object.values(item).some((val) => String(val ?? "").toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const statusLabel = (status: string) => (status === "in" ? "Active" : status === "low" ? "Low" : "Out");
    const statusClass = (status: string) =>
        status === "in"
            ? "bg-[rgba(46,204,113,0.1)] text-[#2ECC71]"
            : status === "low"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700";

    return (
        <div className="flex flex-col flex-grow min-h-0 bg-[#F0F2F5]">
            <div className="px-6 py-5 flex flex-col gap-6">
                <h1 className="text-[1.8rem] font-bold text-[#2C3E50]">Master Data</h1>

                {/* Controls Bar - same as HTML */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <Search
                                className="absolute left-[15px] top-1/2 -translate-y-1/2 text-[#6C757D]"
                                size={16}
                            />
                            <input
                                type="text"
                                placeholder="Search master data..."
                                className="w-[250px] pl-[45px] py-2.5 pr-4 border border-[#E1E8ED] rounded-lg text-[15px] focus:outline-none focus:border-[#4A90E2] focus:ring-[3px] focus:ring-[rgba(74,144,226,0.1)] transition-all text-[#2C3E50]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#6C757D]">
                            <label htmlFor="startDate">From:</label>
                            <input
                                type="date"
                                id="startDate"
                                className="py-2.5 px-4 border border-[#E1E8ED] rounded-lg text-[15px] text-[#2C3E50]"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <label htmlFor="endDate">To:</label>
                            <input
                                type="date"
                                id="endDate"
                                className="py-2.5 px-4 border border-[#E1E8ED] rounded-lg text-[15px] text-[#2C3E50]"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#2ECC71] hover:bg-[#27ae60] text-white font-semibold text-sm rounded-lg shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                        >
                            <Download size={16} /> Export
                        </button>
                        <button
                            type="button"
                            onClick={handleImportClick}
                            disabled={isImporting}
                            className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#F39C12] hover:bg-[#e67e22] text-white font-semibold text-sm rounded-lg shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50"
                        >
                            <Upload size={16} className={isImporting ? "animate-spin" : ""} />
                            {isImporting ? "Importing..." : "Import"}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={fetchProducts}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-semibold text-sm rounded-lg shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Sync
                        </button>
                    </div>
                </div>

                {/* Data Grid - table card like HTML */}
                <div className="bg-white rounded-xl shadow-sm border border-[#E1E8ED] flex-grow overflow-hidden flex flex-col min-h-0">
                    <div className="overflow-auto flex-grow">
                        <table className="w-full border-collapse min-w-[1400px] text-[#2C3E50]">
                            <thead className="sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Item Code
                                    </th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Barcode / QR
                                    </th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Item Name
                                    </th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Category
                                    </th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Description
                                    </th>
                                    <th className="text-right py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Opening Qty
                                    </th>
                                    <th className="text-right py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Current Qty
                                    </th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Location
                                    </th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Status
                                    </th>
                                    <th className="text-right py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Sale Price
                                    </th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Last Updated
                                    </th>
                                    <th className="text-center py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={20} className="py-10 text-center text-[#6C757D]">
                                            <RefreshCw size={24} className="animate-spin mx-auto mb-2 inline-block" />
                                            Loading products...
                                        </td>
                                    </tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={20} className="py-10 text-center text-[#6C757D]">
                                            No products found. Add your first product or adjust filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-[#E1E8ED] hover:bg-[#f8f9fa] transition-colors whitespace-nowrap"
                                        >
                                            <td className="py-3 px-4">{item.sku}</td>
                                            <td className="py-3 px-4">{item.barcode || "—"}</td>
                                            <td className="py-3 px-4 font-medium">{item.name}</td>
                                            <td className="py-3 px-4">{item.category}</td>
                                            <td className="py-3 px-4 max-w-[180px] truncate" title={item.description ?? ""}>
                                                {item.description || "—"}
                                            </td>
                                            <td className="py-3 px-4 text-right">{item.openingStock ?? "—"}</td>
                                            <td className="py-3 px-4 text-right">{item.quantity}</td>
                                            <td className="py-3 px-4">{item.location || "—"}</td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-[0.85rem] font-semibold ${statusClass(item.status)}`}
                                                >
                                                    {statusLabel(item.status)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {item.salePrice != null ? Number(item.salePrice).toFixed(2) : "—"}
                                            </td>
                                            <td className="py-3 px-4">
                                                {item.updatedAt
                                                    ? new Date(item.updatedAt).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                    }).replace(/\//g, "-")
                                                    : "—"}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Product"
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
                </div>
            </div>
        </div>
    );
};

export default MasterData;
