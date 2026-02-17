import React from "react";
import {
    Package,
    AlertTriangle,
    DollarSign,
    Tag,
    Smartphone
} from "lucide-react";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { useEffect } from "react";
import api from "../services/api";
import { useDashboard } from "../context/DashboardContext";
import MobileHeader from '../components/MobileHeader';
import { useIsMobile } from '../hooks/useMediaQuery';

/* =========================
   TYPES
========================= */

type StatusType = "in" | "low" | "out";

interface KpiCardProps {
    icon: React.ElementType;
    title: string;
    value: string;
    change: string;
    trend?: 'up' | 'down' | 'stable';
    iconBg: string;
    iconColor: string;
}

interface RecentItemProps {
    name: string;
    sku: string;
    status: StatusType;
    qty?: string;
}

/* =========================
   DATA
========================= */
const COLORS: string[] = ["#4A90E2", "#F39C12", "#2ECC71", "#9B59B6"];

/* =========================
   HELPERS
========================= */
const formatCompactNumber = (number: number) => {
    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number);
};

/* =========================
   MAIN DASHBOARD
========================= */

const Dashboard: React.FC = () => {
    const { stats, recentProducts, stockTrendData, categoryDistribution, setDashboardData, lastFetched } = useDashboard();
    const isMobile = useIsMobile();


    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const response = await api.get('/inventory/dashboard');
                if (isMounted) {
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

        const shouldFetch = !stats || (Date.now() - lastFetched > 30000);
        if (shouldFetch) {
            fetchData();
        }

        return () => { isMounted = false; };
    }, [stats, lastFetched, setDashboardData]);

    return (
        <div className="space-y-6">
            {isMobile && <MobileHeader title="GST Inventory" />}

            {!isMobile && (
                <h1 className="text-3xl font-bold text-gray-800">
                    Dashboard Overview
                </h1>
            )}

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    icon={Package}
                    title="Total Products"
                    value={stats?.totalProducts?.toLocaleString() || "0"}
                    change="+12% from last month"
                    trend="up"
                    iconBg="bg-[rgba(74,144,226,0.1)]"
                    iconColor="text-[#4A90E2]"
                />
                <KpiCard
                    icon={AlertTriangle}
                    title="Low Stock Items"
                    value={stats?.lowStockItems?.toString() || "0"}
                    change="+5 new today"
                    trend="down"
                    iconBg="bg-[rgba(243,156,18,0.1)]"
                    iconColor="text-[#F39C12]"
                />
                <KpiCard
                    icon={Tag}
                    title="Categories"
                    value={stats?.categoriesCount?.toString() || "0"}
                    change="Stable"
                    trend="stable"
                    iconBg="bg-[rgba(46,204,113,0.1)]"
                    iconColor="text-[#2ECC71]"
                />
                <KpiCard
                    icon={DollarSign}
                    title="Total Stock Value"
                    value={stats?.totalStockValue ? `$${formatCompactNumber(stats.totalStockValue)}` : "$0"}
                    change="+8% from last month"
                    trend="up"
                    iconBg="bg-[rgba(155,89,182,0.1)]"
                    iconColor="text-[#9B59B6]"
                />
            </div>

            {/* MOBILE ACCESS BUTTON */}
            {isMobile && (
                <div className="px-4">
                    <a
                        href="/mobile-ui"
                        className="block p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-blue-400/30"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Smartphone size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-1">📱 Mobile Inventory Hub</h3>
                                    <p className="text-blue-100 text-sm">Tap here to access mobile features</p>
                                </div>
                            </div>
                            <svg className="w-8 h-8 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </a>
                </div>
            )}


            {/* CHARTS */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6`}>
                {/* Stock Trend */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Stock Level Trend</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={(stockTrendData?.length || 0) > 0 ? stockTrendData : []}>
                                <defs>
                                    <linearGradient id="stockIn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="stockOut" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E74C3C" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#E74C3C" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6C757D', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6C757D', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                                <Area type="monotone" dataKey="stockIn" name="Stock In" stroke="#4A90E2" fill="url(#stockIn)" strokeWidth={3} />
                                <Area type="monotone" dataKey="stockOut" name="Stock Out" stroke="#E74C3C" fill="url(#stockOut)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Stock by Category</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={(categoryDistribution?.length || 0) > 0 ? categoryDistribution : [{ name: 'No Data', value: 1 }]}
                                    dataKey="value"
                                    innerRadius={isMobile ? 60 : 80}
                                    outerRadius={isMobile ? 80 : 100}
                                    paddingAngle={5}
                                >
                                    {((categoryDistribution?.length || 0) > 0 ? categoryDistribution : [{ name: 'No Data', value: 1 }]).map((_entry: any, index: number) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* RECENT PRODUCTS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Products</h3>
                <div className="overflow-x-auto">
                    <ul className="divide-y divide-gray-100">
                        {recentProducts.length > 0 ? (
                            recentProducts.map((product: any) => (
                                <RecentItem
                                    key={product.id}
                                    name={product.name}
                                    sku={product.sku}
                                    status={product.status as any}
                                    qty={product.quantity?.toString()}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 italic py-4">No recent products found</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

/* =========================
   KPI CARD
========================= */

const KpiCard: React.FC<KpiCardProps> = ({
    icon: Icon,
    title,
    value,
    change,
    trend = 'stable',
    iconBg,
    iconColor,
}) => {
    let trendColor = "text-gray-500";
    if (trend === 'up') trendColor = "text-[#2ECC71]";
    if (trend === 'down') trendColor = "text-[#E74C3C]";

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 transition-transform hover:-translate-y-1 duration-300">
            <div className={`w-16 h-16 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center text-2xl flex-shrink-0`}>
                <Icon size={30} />
            </div>
            <div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
                <div className="text-sm text-gray-500 mb-1">{title}</div>
                <div className={`text-xs font-semibold ${trendColor}`}>
                    {change}
                </div>
            </div>
        </div>
    );
};

/* =========================
   RECENT ITEM
========================= */

const RecentItem: React.FC<RecentItemProps> = ({
    name,
    sku,
    status,
    qty,
}) => {
    const statusConfig: Record<StatusType, { bg: string, color: string, text: string }> = {
        in: { bg: "bg-[rgba(46,204,113,0.1)]", color: "text-[#2ECC71]", text: `In Stock (${qty ?? 0})` },
        low: { bg: "bg-[rgba(243,156,18,0.1)]", color: "text-[#F39C12]", text: `Low Stock (${qty ?? 0})` },
        out: { bg: "bg-[rgba(231,76,60,0.1)]", color: "text-[#E74C3C]", text: "Out of Stock" },
    };

    const config = statusConfig[status];

    return (
        <li className="py-4 flex justify-between items-center hover:bg-gray-50 transition-colors px-2 rounded-lg cursor-default">
            <div className="flex items-center gap-4">
                <div>
                    <p className="font-semibold text-gray-800">{name}</p>
                    <p className="text-xs text-gray-500 font-medium">{sku}</p>
                </div>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.color}`}>
                {config.text}
            </span>
        </li>
    );
};
