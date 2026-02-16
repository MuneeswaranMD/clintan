import React, { useState } from 'react';
import {
    LayoutDashboard,
    Building2,
    Users,
    Settings,
    Bell,
    Search,
    CreditCard,
    DollarSign,
    TrendingUp,
    Package,
    ToggleLeft,
    Database,
    Zap,
    FileText,
    MessageSquare,
    Share2,
    Tag,
    Menu,
    X,
    ChevronRight,
    LogOut,
    User,
    ChevronDown,
    Command,
    Plus
} from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';

interface SuperAdminLayoutProps {
    onLogout: () => void;
    children?: React.ReactNode;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ onLogout, children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

    const menuItems = [
        { label: 'Dashboard', path: '/super/dashboard', icon: LayoutDashboard },
        { label: 'Tenants', path: '/super/tenants', icon: Building2, badge: '128' },
        { label: 'Industries', path: '/super/industries', icon: Tag },
        { label: 'Modules', path: '/super/modules', icon: Package },
        { label: 'Subscription Plans', path: '/super/plans', icon: CreditCard },
        { label: 'Revenue & Billing', path: '/super/revenue', icon: DollarSign },
        { label: 'Platform Users', path: '/super/users', icon: Users },
        { label: 'Analytics', path: '/super/analytics', icon: TrendingUp },
        { label: 'Feature Flags', path: '/super/feature-flags', icon: ToggleLeft, badge: 'New' },
        { label: 'System Settings', path: '/super/settings', icon: Settings },
        { label: 'Notifications', path: '/super/notifications', icon: Bell, badge: '3' },
        { label: 'Branch Monitoring', path: '/super/branches', icon: Building2 },
        { label: 'Communication', path: '/super/comms', icon: MessageSquare },
        { label: 'Growth Tools', path: '/super/growth', icon: Share2 },
        { label: 'Infra & DB', path: '/super/infra', icon: Database },
        { label: 'Automation', path: '/super/automation', icon: Zap },
        { label: 'Logs & Monitoring', path: '/super/logs', icon: FileText }
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-50`}>
                {/* Logo Section */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <Command size={22} strokeWidth={2.5} />
                        </div>
                        {isSidebarOpen && (
                            <div className="leading-none">
                                <h1 className="text-lg font-black text-slate-900 tracking-tight">Nexus Admin</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise v4.2</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide space-y-1">
                    {menuItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active
                                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                <item.icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                {isSidebarOpen && (
                                    <div className="flex-1 flex items-center justify-between">
                                        <span className={`text-sm font-bold ${active ? 'font-black' : 'font-semibold'}`}>{item.label}</span>
                                        {item.badge && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Footer */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 group transition-all"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="text-sm font-bold uppercase tracking-widest">Terminate</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-6 flex-1">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <div className="max-w-md w-full relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Universal command scan..."
                                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:border-blue-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end leading-none mr-2">
                            <p className="text-sm font-black text-slate-900">Muneeswaran</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform Owner</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-500 transition-all cursor-pointer">
                            <User size={24} />
                        </div>
                        <div className="w-1 h-8 bg-slate-200"></div>
                        <button className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-all">
                            <Plus size={20} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    {children || <Outlet />}
                </div>
            </main>
        </div>
    );
};
