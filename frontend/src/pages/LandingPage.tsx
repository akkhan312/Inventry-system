import { Link } from 'react-router-dom';
import { LayoutDashboard, Smartphone, LogIn, UserPlus, Package } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 animate-pulse delay-700"></div>

            {/* Content Container */}
            <div className="max-w-6xl w-full relative z-10 flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-700">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/20 rotate-3 hover:rotate-6 transition-transform">
                        <Package size={40} className="text-white" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                        GST Inventory
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        Next-generation inventory management system. Select your platform to continue.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-2 gap-8 w-full">

                    {/* Admin Dashboard Card */}
                    <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full justify-between">
                            <div className="p-6 bg-blue-500/20 rounded-2xl mb-8 group-hover:bg-blue-500/30 transition-colors ring-1 ring-blue-500/30">
                                <LayoutDashboard size={48} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                            </div>

                            <div className="mb-10">
                                <h2 className="text-3xl font-bold mb-4 text-white group-hover:text-blue-200 transition-colors">
                                    Web Admin Dashboard
                                </h2>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    Comprehensive control panel for administrators. Manage inventory, users, settings, and view detailed analytics.
                                </p>
                            </div>

                            <Link
                                to="/login"
                                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 group-hover:translate-y-0 translate-y-2"
                            >
                                <LogIn size={20} />
                                Admin Login
                            </Link>
                        </div>
                    </div>

                    {/* Mobile UI Card */}
                    <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-12 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center text-center h-full justify-between">
                            <div className="p-6 bg-emerald-500/20 rounded-2xl mb-8 group-hover:bg-emerald-500/30 transition-colors ring-1 ring-emerald-500/30">
                                <Smartphone size={48} className="text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                            </div>

                            <div className="mb-10">
                                <h2 className="text-3xl font-bold mb-4 text-white group-hover:text-emerald-200 transition-colors">
                                    Mobile Application
                                </h2>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    Optimized for field operations. Scan barcodes, track stock movements, and manage inventory on the go.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full group-hover:translate-y-0 translate-y-2 transition-transform">
                                <Link
                                    to="/mobile-login"
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40"
                                >
                                    <LogIn size={20} />
                                    Login
                                </Link>
                                <Link
                                    to="/mobile-signup"
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all border border-slate-700 hover:border-slate-600"
                                >
                                    <UserPlus size={20} />
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-16 text-slate-600 text-sm font-medium tracking-wide">
                    &copy; {new Date().getFullYear()} GST INVENTORY SYSTEM
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
