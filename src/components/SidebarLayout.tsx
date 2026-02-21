import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Users, Package, DollarSign, BarChart3, Settings,
    Menu, X, Search, Bell, Plus, ChevronDown, Building2, User as UserIcon,
    LogOut, ShoppingCart, FileSpreadsheet, CreditCard, Clock, TrendingUp,
    Boxes, Tags, Warehouse, ShoppingBag, Calendar, Briefcase, ChevronRight,
    Shield, Zap, Command, AlertCircle
} from 'lucide-react';
import { User } from '../types';
import { NotificationBell } from './NotificationBell';
import { getGroupedNavItems, CATEGORY_LABELS } from '../config/navigationConfig';
import { useShop } from '../context/ShopContext';
import { tenantService } from '../services/firebaseService';
import { useTenant } from '../context/TenantContext';
import { SubscriptionLock } from './SubscriptionLock';

interface SidebarLayoutProps {
    children: React.ReactNode;
    user: User;
    onLogout: () => void;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, user, onLogout }) => {
    const { tenant, isWhiteLabeled } = useTenant();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const { businessConfig } = useShop();

    const SUPER_ADMIN_EMAILS = ['muneeswaran@averqon.in', 'whatnew.live@gmail.com'];
    const isSuperAdmin = user && (user.role === 'SUPER_ADMIN' || SUPER_ADMIN_EMAILS.includes(user.email));

    // ... (expiry logic)
    const subConfig = tenant?.config?.subscription;
    const expiryDate = subConfig?.expiresAt ? new Date(subConfig.expiresAt) : null;
    const graceDate = expiryDate ? new Date(expiryDate) : null;
    if (graceDate) graceDate.setDate(graceDate.getDate() + 3);
    const isExpired = !!graceDate && graceDate < new Date();
    const shouldLock = isExpired && !isSuperAdmin && !location.pathname.includes('/settings');

    const effectiveCompanyName = tenant?.companyName || user.name || 'Averqon';
    const effectivePlan = isSuperAdmin ? 'ENTERPRISE' : (tenant?.plan || 'Starter');
    const verificationStatus = tenant?.config?.verification?.status || 'Unverified';
    const isVerified = verificationStatus === 'Verified';

    const groupedData = getGroupedNavItems(
        tenant?.config?.features || businessConfig.features,
        tenant?.enabledModules || businessConfig.enabledModules,
        user?.role || 'VIEWER',
        isSuperAdmin
    );
    // ... Skipping navigationSections and isActive definition as they remain same but just for context ...
    const categoryOrder = ['core', 'sales', 'finance', 'inventory', 'industry', 'advanced', 'settings'];
    const navigationSections: any[] = [];
    categoryOrder.forEach(catKey => {
        if (groupedData[catKey]?.length > 0) {
            navigationSections.push({ title: CATEGORY_LABELS[catKey] || catKey, items: groupedData[catKey] });
        }
    });

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex overflow-hidden">
            <SubscriptionLock isExpired={shouldLock} planName={effectivePlan} />

            <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-[var(--color-border)] ${isSidebarCollapsed ? 'w-[80px]' : 'w-[250px]'} ${isMobileSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:translate-x-0'} transition-all duration-300 flex flex-col`}>
                <div className="h-20 flex items-center justify-center px-4 mb-4">
                    {!isSidebarCollapsed ? (
                        <div className="flex items-center gap-3 animate-fade-in py-6 w-full px-2">
                            <div className="min-w-[40px] w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-slate-200">
                                {tenant?.logoUrl ? <img src={tenant.logoUrl} className="w-full h-full object-contain p-1" /> : effectiveCompanyName.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="font-extrabold text-[15px] text-slate-800 tracking-tight truncate leading-none">{effectiveCompanyName}</div>
                                <div className="text-[9px] text-slate-400 font-bold  tracking-widest opacity-60 flex-shrink-0 mt-1">{effectivePlan}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center font-black text-base shadow-sm mx-auto overflow-hidden">
                            {tenant?.logoUrl ? <img src={tenant.logoUrl} className="w-full h-full object-contain p-1" /> : effectiveCompanyName.charAt(0)}
                        </div>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto px-4 scrollbar-hide">
                    {navigationSections.map((section, idx) => (
                        <div key={idx} className="mb-4">
                            {section.title && !isSidebarCollapsed && <h3 className="text-[10px] font-black text-slate-400 px-2 mb-2 mt-4">{section.title}</h3>}
                            <div className="space-y-1">
                                {section.items.map((item: any) => (
                                    <NavLink key={item.path} to={item.path} onClick={() => setIsMobileSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive(item.path) ? 'bg-[var(--color-primary)] text-white shadow-xl shadow-[var(--color-primary)]/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'} ${isSidebarCollapsed ? 'justify-center' : ''}`} title={isSidebarCollapsed ? item.label : undefined}>
                                        <div className={`p-1.5 rounded-lg transition-colors ${isActive(item.path) ? 'bg-white/20' : 'bg-slate-50'}`}>
                                            <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'text-[var(--color-primary)]'} strokeWidth={2.5} />
                                        </div>
                                        {!isSidebarCollapsed && <span className="text-[13px] font-bold tracking-tight">{item.label}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 mt-auto bg-slate-50/30">
                    <button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        <LogOut size={18} strokeWidth={2.5} />
                        {!isSidebarCollapsed && <span className="text-[10px] uppercase tracking-widest">Sign Out</span>}
                    </button>
                </div>
            </aside>

            <main className={`flex-1 flex flex-col min-h-screen relative ${isSidebarCollapsed ? 'md:ml-[80px]' : 'md:ml-[250px]'} transition-all duration-300`}>
                <div
                    className="absolute top-0 left-0 right-0 h-[320px] z-0 rounded-b-[4rem] shadow-2xl opacity-100 transition-all duration-700"
                    style={{
                        background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-dark) 100%)`,
                        opacity: 0.9
                    }}
                />

                <header className="h-20 flex items-center px-4 md:px-8 bg-transparent z-30 justify-between mt-2">
                    <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2.5 hover:bg-white/10 rounded-xl md:hidden text-white"><Menu size={22} /></button>
                        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2.5 hover:bg-white/10 rounded-xl hidden md:block text-white"><Menu size={20} /></button>
                        <div className="relative hidden lg:block group max-w-sm w-full ml-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                            <input type="text" placeholder="Instance Search..." className="w-full h-11 pl-11 pr-4 bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white placeholder:text-white/40 focus:bg-white/20 outline-none backdrop-blur-md" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationBell iconClassName="text-white" />
                        <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="h-11 px-3 flex items-center gap-3 rounded-xl hover:bg-white/10 transition-all text-white">
                            <div className="hidden md:flex flex-col items-end leading-none">
                                <p className="text-sm font-bold">{effectiveCompanyName}</p>
                                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{effectivePlan}</p>
                            </div>
                            <div className="w-9 h-9 bg-white/10 rounded-full border border-white/20 flex items-center justify-center overflow-hidden">
                                {tenant?.logoUrl ? (
                                    <img src={tenant.logoUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 size={16} />
                                )}
                            </div>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide relative z-10 mt-2">
                    <div className="max-w-[1600px] mx-auto space-y-6">
                        {!isVerified && !isSuperAdmin && (
                            <div className={`bg-white border-l-4 ${verificationStatus === 'Rejected' ? 'border-rose-500' : 'border-amber-500'} p-5 rounded-r-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-in`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${verificationStatus === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                            {verificationStatus === 'Pending' ? 'Verification In Progress' :
                                                verificationStatus === 'Rejected' ? 'Verification Rejected' :
                                                    'Identity Verification Required'}
                                        </h4>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                            {verificationStatus === 'Pending' ? 'Our compliance team is reviewing your documents.' :
                                                verificationStatus === 'Rejected' ? (tenant?.config?.verification?.rejectionReason || 'Please review your documents and resubmit.') :
                                                    'Submit company documents to unlock full platform capabilities.'}
                                        </p>
                                    </div>
                                </div>
                                {verificationStatus !== 'Pending' && (
                                    <button onClick={() => navigate('/settings/company?tab=documents')} className={`px-6 py-2.5 ${verificationStatus === 'Rejected' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'} text-white rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all`}>
                                        {verificationStatus === 'Rejected' ? 'Re-Submit' : 'Verify Now'}
                                    </button>
                                )}
                            </div>
                        )}
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

