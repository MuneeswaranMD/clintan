import React, { useState } from 'react';
import { LayoutDashboard, Building2, ShieldCheck, Users, Settings, Bell, Search, CreditCard, DollarSign, TrendingUp, Package, ToggleLeft, Database, Zap, FileText, MessageSquare, Share2, Tag, Menu, X, ChevronRight, LogOut, User, ChevronDown, Command, Plus } from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';

interface SuperAdminLayoutProps {
    onLogout: () => void;
    user: any; // Using any to avoid complex type import for now, or use User from types
    children?: React.ReactNode;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ onLogout, user, children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const location = useLocation();

    // Platform Owner Emails
    const SUPER_ADMIN_EMAILS = ['muneeswaran@averqon.in', 'clintan@averqon.in'];
    const isSuperAdmin = user && (user.role === 'SUPER_ADMIN' || SUPER_ADMIN_EMAILS.includes(user.email));

    const menuItems = [
        { label: 'Dashboard', path: '/super/dashboard', icon: LayoutDashboard },
        { label: 'Tenants', path: '/super/tenants', icon: Building2, badge: '128' },
        { label: 'Verification', path: '/super/verification', icon: ShieldCheck },
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

    // Safety check - though Guard should handle this
    if (!isSuperAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    bg-white border-r border-[var(--color-border)]
                    ${isSidebarCollapsed ? 'w-[80px]' : 'w-[250px]'}
                    ${isMobileSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:translate-x-0'}
                    transition-all duration-300 ease-[var(--transition-cubic)]
                    flex flex-col
                `}
            >
                {/* Logo Section */}
                <div className="h-20 flex items-center justify-center px-4 mb-4">
                    {!isSidebarCollapsed ? (
                        <div className="flex items-center gap-3 animate-fade-in py-6 w-full px-2">
                            <div className="min-w-[40px] w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg active:scale-95 transition-transform flex-shrink-0">
                                <Command size={22} strokeWidth={3} />
                            </div>
                            <div className="flex items-baseline gap-1.5 min-w-0">
                                <div className="font-extrabold text-[15px] text-slate-800 tracking-tight truncate leading-none">Averqon Admin</div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60 flex-shrink-0">Pro</div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-black text-base shadow-md mx-auto">
                            <Command size={22} strokeWidth={3} />
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 scrollbar-hide">
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-xl
                                        transition-all duration-200 group relative
                                        ${active
                                            ? 'bg-gradient-primary text-white shadow-md shadow-primary/20'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
                                        ${isSidebarCollapsed ? 'justify-center' : ''}
                                    `}
                                    title={isSidebarCollapsed ? item.label : undefined}
                                >
                                    <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-white'}`}>
                                        <item.icon
                                            size={16}
                                            className={`${active ? 'text-white' : 'text-primary'}`}
                                            strokeWidth={3}
                                        />
                                    </div>
                                    {!isSidebarCollapsed && (
                                        <div className="flex-1 flex items-center justify-between">
                                            <span className={`text-[13px] font-bold tracking-tight ${active ? 'opacity-100' : 'opacity-85'}`}>{item.label}</span>
                                            {item.badge && (
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm ${active ? 'bg-white text-primary' : 'bg-red-500 text-white'}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom Footer */}
                <div className="p-4 border-t border-[var(--color-border-light)] mt-auto bg-slate-50/30">
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-error font-bold hover:bg-red-50 group transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={18} strokeWidth={3} />
                        {!isSidebarCollapsed && <span className="text-[11px] uppercase tracking-widest">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main className={`
                flex-1 flex flex-col min-h-screen relative
                ${isSidebarCollapsed ? 'md:ml-[80px]' : 'md:ml-[250px]'}
                transition-all duration-300 ease-[var(--transition-cubic)]
            `}>
                {/* Hero Background Decoration */}
                <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-primary z-0 rounded-b-[2rem] shadow-lg opacity-90" />

                {/* Top Header */}
                <header className="h-16 flex items-center px-4 md:px-8 bg-transparent z-30 justify-between mt-2">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="p-2.5 hover:bg-white/10 rounded-xl transition-all md:hidden active:scale-90 text-white"
                        >
                            <Menu size={22} />
                        </button>

                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="p-2.5 hover:bg-white/10 rounded-xl transition-all hidden md:block active:scale-90 text-white"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="relative hidden lg:block group max-w-sm w-full ml-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 transition-colors group-focus-within:text-white" size={16} />
                            <input
                                type="text"
                                placeholder="Universal scan..."
                                className="w-full h-10 pl-11 pr-4 bg-white/10 border border-white/20 rounded-xl text-sm font-medium text-white placeholder:text-white/60 focus:bg-white/20 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="h-10 px-3 flex items-center gap-3 rounded-xl hover:bg-white/10 transition-all active:scale-95 text-white"
                            >
                                <div className="hidden md:flex flex-col items-end leading-none">
                                    <p className="text-sm font-bold">{user?.name || 'Admin User'}</p>
                                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Platform Owner</p>
                                </div>
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                    <User size={16} />
                                </div>
                                <ChevronDown size={14} className="opacity-60" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide relative z-10 mt-4">
                    <div className="max-w-[1600px] mx-auto animate-fade-in">
                        {children || <Outlet />}
                    </div>
                </div>
            </main>
        </div>
    );
};
