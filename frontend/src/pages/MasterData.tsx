import { useState, useEffect, useRef } from "react";
import { Search, RefreshCw, Download, Upload, Trash2, FileText, Printer } from "lucide-react";
import api from "../services/api";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

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
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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
                setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
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

    // ── Filtering ──────────────────────────────────────────────────────────────
    const filteredItems = products.filter((item) => {
        const matchesSearch = Object.values(item).some((val) =>
            String(val ?? "").toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!matchesSearch) return false;
        if (startDate) {
            const created = new Date(item.createdAt);
            if (created < new Date(startDate)) return false;
        }
        if (endDate) {
            const created = new Date(item.createdAt);
            if (created > new Date(endDate + "T23:59:59")) return false;
        }
        return true;
    });

    // ── Selection helpers ──────────────────────────────────────────────────────
    const allVisibleIds = filteredItems.map((i) => i.id);
    const allSelected =
        allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id));
    const someSelected = allVisibleIds.some((id) => selectedIds.has(id));

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                allVisibleIds.forEach((id) => next.delete(id));
                return next;
            });
        } else {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                allVisibleIds.forEach((id) => next.add(id));
                return next;
            });
        }
    };

    const toggleSelectOne = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // ── Print (barcode label style) ────────────────────────────────────────────
    const handlePrint = async () => {
        const toPrint =
            selectedIds.size > 0
                ? filteredItems.filter((i) => selectedIds.has(i.id))
                : filteredItems;

        if (toPrint.length === 0) return;

        const labelPromises = toPrint.map(async (item) => {
            const barcodeValue = item.barcode || item.sku;

            // Generate barcode as data URL using JsBarcode on a hidden canvas
            let barcodeDataUrl = "";
            try {
                const canvas = document.createElement("canvas");
                JsBarcode(canvas, barcodeValue, {
                    format: "CODE128",
                    width: 2,
                    height: 50,
                    displayValue: false,
                    margin: 0,
                    background: "#ffffff",
                    lineColor: "#000000",
                });
                barcodeDataUrl = canvas.toDataURL("image/png");
            } catch {
                barcodeDataUrl = "";
            }

            // Generate QR code as data URL
            let qrDataUrl = "";
            try {
                qrDataUrl = await QRCode.toDataURL(barcodeValue, {
                    width: 60,
                    margin: 1,
                    errorCorrectionLevel: "M",
                });
            } catch {
                qrDataUrl = "";
            }

            const logoUrl = `${window.location.origin}/gst.png`;

            return `
            <div class="label">
              <div class="label-header">
                <img class="logo" src="${logoUrl}" alt="GST Logo" />
                ${qrDataUrl ? `<img class="qr" src="${qrDataUrl}" alt="QR" />` : ""}
              </div>
              <div class="divider"></div>
              ${barcodeDataUrl
                    ? `<img class="barcode" src="${barcodeDataUrl}" alt="Barcode" />`
                    : `<div class="barcode-placeholder">${barcodeValue}</div>`
                }
              <div class="label-footer">
                <strong>${item.sku}</strong>
                <span>${item.name}</span>
              </div>
            </div>`;
        });

        const labelHTMLParts = await Promise.all(labelPromises);
        const labelsHTML = labelHTMLParts.join("");

        const printWindow = window.open("", "_blank", "width=960,height=700");
        if (!printWindow) return;

        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Barcode Labels</title>
  <style>
    @page {
      size: 2.5in 1.5in;
      margin: 0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 2.5in;
      height: 1.5in;
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #fff;
    }
    .labels-grid {
      display: block;
    }
    .label {
      width: 2.5in;
      height: 1.5in;
      padding: 3px 6px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      page-break-after: always;
      break-after: page;
      background: #fff;
    }
    .label:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }
    .label-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      width: 100%;
      height: 0.33in;
    }
    .logo {
      height: 100%;
      max-width: 1.4in;
      object-fit: contain;
      object-position: left center;
    }
    .qr {
      width: 0.33in;
      height: 0.33in;
      object-fit: contain;
      flex-shrink: 0;
    }
    .divider {
      height: 1px;
      background: #000;
      flex-shrink: 0;
      width: 100%;
    }
    .barcode {
      width: 100%;
      height: 0.43in;
      object-fit: fill;
      display: block;
      flex-shrink: 0;
      align-self: center;
    }
    .barcode-placeholder {
      font-size: 7px;
      font-family: monospace;
      letter-spacing: 1px;
      text-align: center;
    }
    .label-footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      line-height: 1.1;
    }
    .label-footer strong {
      font-size: 7.5pt;
      font-weight: 700;
      color: #000;
    }
    .label-footer span {
      font-size: 6.5pt;
      color: #222;
    }
  </style>
</head>
<body>
  <div class="labels-grid">
    ${labelsHTML}
  </div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`);

        printWindow.document.close();
    };

    // ── Status helpers ─────────────────────────────────────────────────────────
    const statusLabel = (status: string) =>
        status === "in" ? "Active" : status === "low" ? "Low" : "Out";

    const statusClass = (status: string) =>
        status === "in"
            ? "bg-[rgba(46,204,113,0.1)] text-[#2ECC71]"
            : status === "low"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700";

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col flex-grow min-h-0 bg-[#F0F2F5]">
            <div className="px-6 py-5 flex flex-col gap-6">
                <h1 className="text-[1.8rem] font-bold text-[#2C3E50]">Master Data</h1>

                {/* Controls Bar */}
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
                        {/* Selection badge */}
                        {selectedIds.size > 0 && (
                            <span className="text-sm text-[#4A90E2] font-medium bg-[rgba(74,144,226,0.1)] px-3 py-1.5 rounded-lg">
                                {selectedIds.size} selected
                            </span>
                        )}

                        {/* Print */}
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#6C3483] hover:bg-[#5B2C6F] text-white font-semibold text-sm rounded-lg shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                            title={selectedIds.size > 0 ? `Print ${selectedIds.size} selected rows` : "Print all rows"}
                        >
                            <Printer size={16} />
                            Print{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
                        </button>

                        <button
                            type="button"
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#2ECC71] hover:bg-[#27ae60] text-white font-semibold text-sm rounded-lg shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                        >
                            <Download size={16} /> Export
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const headers = [
                                    "SKU", "Item Name", "Category", "Description", "Barcode / QR",
                                    "Unit", "Current Qty", "Purchase Price", "Sale Price",
                                    "HSN Code", "GST Rate (%)", "Opening Qty", "Min Stock",
                                    "Reorder Qty", "Location", "Supplier", "Serial / Batch", "Expiry Date"
                                ];
                                const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
                                const encodedUri = encodeURI(csvContent);
                                const link = document.createElement("a");
                                link.setAttribute("href", encodedUri);
                                link.setAttribute("download", "inventory_template.csv");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#95A5A6] hover:bg-[#7F8C8D] text-white font-semibold text-sm rounded-lg shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                        >
                            <FileText size={16} /> Template
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

                {/* Data Grid */}
                <div className="bg-white rounded-xl shadow-sm border border-[#E1E8ED] flex-grow overflow-hidden flex flex-col min-h-0">
                    <div className="overflow-auto flex-grow">
                        <table className="w-full border-collapse min-w-[1400px] text-[#2C3E50]">
                            <thead className="sticky top-0 z-10 shadow-sm">
                                <tr>
                                    {/* Select-all checkbox */}
                                    <th className="py-3 px-4 bg-[#f8f9fa] border-b-2 border-[#E1E8ED] w-10">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            ref={(el) => {
                                                if (el) el.indeterminate = someSelected && !allSelected;
                                            }}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 accent-[#4A90E2] cursor-pointer"
                                            title="Select / deselect all visible rows"
                                        />
                                    </th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">Item Code</th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">Barcode / QR</th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">Item Name</th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">Category</th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">Description</th>
                                    <th className="text-right py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">Opening Qty</th>
                                    <th className="text-right py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">Current Qty</th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">Location</th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">Status</th>
                                    <th className="text-right py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">Sale Price</th>
                                    <th className="text-left py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">Last Updated</th>
                                    <th className="text-center py-3 px-4 bg-[#f8f9fa] font-semibold border-b-2 border-[#E1E8ED] whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={13} className="py-10 text-center text-[#6C757D]">
                                            <RefreshCw size={24} className="animate-spin mx-auto mb-2 inline-block" />
                                            Loading products...
                                        </td>
                                    </tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className="py-10 text-center text-[#6C757D]">
                                            No products found. Add your first product or adjust filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map((item) => {
                                        const isSelected = selectedIds.has(item.id);
                                        return (
                                            <tr
                                                key={item.id}
                                                onClick={() => toggleSelectOne(item.id)}
                                                className={`border-b border-[#E1E8ED] transition-colors whitespace-nowrap cursor-pointer
                                                    ${isSelected
                                                        ? "bg-[rgba(74,144,226,0.08)] hover:bg-[rgba(74,144,226,0.13)]"
                                                        : "hover:bg-[#f8f9fa]"
                                                    }`}
                                            >
                                                {/* Row checkbox */}
                                                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectOne(item.id)}
                                                        className="w-4 h-4 accent-[#4A90E2] cursor-pointer"
                                                    />
                                                </td>
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
                                                    <span className={`inline-block px-3 py-1 rounded-full text-[0.85rem] font-semibold ${statusClass(item.status)}`}>
                                                        {statusLabel(item.status)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {item.salePrice != null ? Number(item.salePrice).toFixed(2) : "—"}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {item.updatedAt
                                                        ? new Date(item.updatedAt)
                                                            .toLocaleDateString("en-GB", {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                            })
                                                            .replace(/\//g, "-")
                                                        : "—"}
                                                </td>
                                                <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
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
