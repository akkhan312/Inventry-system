import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface DashboardStats {
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
    categoriesCount: number;
    physicalCountSessions?: number;
    totalStockValue?: number;
}

interface StockTrend {
    month: string;
    stockIn: number;
    stockOut: number;
}

interface CategoryData {
    name: string;
    value: number;
}

interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    price: number;
    status: string;
}

interface User {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    status: string;
}

interface DashboardContextType {
    stats: DashboardStats | null;
    recentProducts: Product[];
    stockTrendData: StockTrend[];
    categoryDistribution: CategoryData[];
    setDashboardData: (stats: DashboardStats, recent: Product[], trends: StockTrend[], categories: CategoryData[]) => void;
    lastFetched: number;
    users: User[];
    setUsersData: (users: User[]) => void;
    usersLastFetched: number;
    currentUser: User | null;
    updateCurrentUser: (user: User) => void;
    language: 'en' | 'ar';
    dir: 'ltr' | 'rtl';
    toggleLanguage: () => void;
    logout: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentProducts, setRecentProducts] = useState<Product[]>([]);
    const [stockTrendData, setStockTrendData] = useState<StockTrend[]>([]);
    const [categoryDistribution, setCategoryDistribution] = useState<CategoryData[]>([]);
    const [lastFetched, setLastFetched] = useState<number>(0);

    const [users, setUsers] = useState<User[]>([]);
    const [usersLastFetched, setUsersLastFetched] = useState<number>(0);
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = sessionStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const [language, setLanguage] = useState<'en' | 'ar'>(() => {
        return (localStorage.getItem('language') as 'en' | 'ar') || 'en';
    });

    const dir = language === 'ar' ? 'rtl' : 'ltr';

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
        localStorage.setItem('language', newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setCurrentUser(null);
    };

    // Initialize HTML attributes on mount
    React.useEffect(() => {
        document.documentElement.dir = dir;
        document.documentElement.lang = language;
    }, [dir, language]);

    const setDashboardData = (newStats: DashboardStats, newRecent: Product[], newTrends: StockTrend[], newCategories: CategoryData[]) => {
        setStats(newStats);
        setRecentProducts(newRecent);
        setStockTrendData(newTrends);
        setCategoryDistribution(newCategories);
        setLastFetched(Date.now());
    };

    const setUsersData = (newUsers: User[]) => {
        setUsers(newUsers);
        setUsersLastFetched(Date.now());
    };

    const updateCurrentUser = (user: User) => {
        setCurrentUser(user);
        sessionStorage.setItem('user', JSON.stringify(user));
    };

    return (
        <DashboardContext.Provider value={{
            stats,
            recentProducts,
            stockTrendData,
            categoryDistribution,
            setDashboardData,
            lastFetched,
            users,
            setUsersData,
            usersLastFetched,
            currentUser,
            updateCurrentUser,
            language,
            dir,
            toggleLanguage,
            logout
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
