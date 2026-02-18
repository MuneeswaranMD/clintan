import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Users,
    Package,
    DollarSign,
    BarChart3,
    Settings,
    Menu,
    X,
    Search,
    Bell,
    Plus,
    ChevronDown,
    Building2,
    User as UserIcon,
    LogOut,
    ShoppingCart,
    FileSpreadsheet,
    CreditCard,
    Clock,
    TrendingUp,
    Boxes,
    Tags,
    Warehouse,
    ShoppingBag,
    Calendar,
    Briefcase,
    ChevronRight,
    Shield,
    Zap,
    Command
} from 'lucide-react';
import * as IconLibrary from 'lucide-react'; // Import all icons for dynamic resolution

import { User } from '../types';
import { NotificationBell } from './NotificationBell';
import { getFilteredNavItems, getGroupedNavItems, CATEGORY_LABELS } from '../config/navigationConfig';
import { useShop } from '../context/ShopContext';
import { GlobalCartDrawer } from './shop/GlobalCartDrawer';
import { FloatingCartButton } from './shop/FloatingCartButton';
import { BranchSelector } from './BranchSelector';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { tenantService } from '../services/firebaseService';

interface SidebarLayoutProps {
    children: React.ReactNode;
    user: User;
    onLogout: () => void;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

interface NavItem {
    path: string;
    label: string;
    icon: any;
    badge?: string;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, user, onLogout }) => {
    const { tenant, isWhiteLabeled } = useTenant();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [dbCompanyName, setDbCompanyName] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { businessConfig } = useShop();

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            if (isWhiteLabeled && tenant) {
                setDbCompanyName(tenant.companyName);
                if ((tenant as any).logo) {
                    setLogoUrl((tenant as any).logo);
                }
                return;
            }

            if (!user) return;
            try {
                const company = await tenantService.getTenantByUserId(user.id);
                if (company) {
                    if (company.logoUrl) {
                        setLogoUrl(company.logoUrl);
                    }
                    if (company.companyName) {
                        setDbCompanyName(company.companyName);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch company details", error);
            }
        };
        fetchCompanyDetails();
    }, [user, tenant, isWhiteLabeled]);

    const handleCheckout = () => {
        navigate('/checkouts');
    };

    const effectiveCompanyName = isWhiteLabeled && tenant ? tenant.companyName : (user.email === 'muneeswaran@averqon.in' ? 'Averqon' : (dbCompanyName || user.name));
    const effectivePlan = isWhiteLabeled && tenant ? tenant.plan : 'Pro';

    const SUPER_ADMIN_EMAILS = ['muneeswaran@averqon.in'];
    const isSuperAdmin = user && (user.role === 'SUPER_ADMIN' || SUPER_ADMIN_EMAILS.includes(user.email));

    // Get grouped items based on configuration
    const groupedData = getGroupedNavItems(businessConfig.features, isSuperAdmin);

    // Default categories order
    const categoryOrder = ['core', 'sales', 'finance', 'inventory', 'industry', 'advanced', 'settings'];

    // Construct final navigation sections
    const navigationSections: NavSection[] = [];

    // Add sections in specific order
    categoryOrder.forEach(catKey => {
        if (groupedData[catKey]?.length > 0) {
            navigationSections.push({
                title: CATEGORY_LABELS[catKey] || catKey,
                items: groupedData[catKey]
            });
        }
    });

    // Add any remaining categories not in the order list
    Object.keys(groupedData).forEach(catKey => {
        if (!categoryOrder.includes(catKey)) {
            navigationSections.push({
                title: CATEGORY_LABELS[catKey] || catKey,
                items: groupedData[catKey]
            });
        }
    });

    const createMenuItems = [];

    if (businessConfig.features?.enableInvoices) {
        createMenuItems.push({ label: 'Create Invoice', action: () => navigate('/invoices') });
    }

    if (businessConfig.features?.enableEstimates) {
        createMenuItems.push({ label: 'Create Estimate', action: () => navigate('/estimates') });
    }

    if (businessConfig.features?.enableOrders) {
        createMenuItems.push({ label: 'Create Order', action: () => navigate('/orders') });
    }

    if (businessConfig.features?.enableCustomers) {
        createMenuItems.push({ label: 'Add Customer', action: () => navigate('/customers') });
    }

    if (businessConfig.features?.enableInventory) {
        createMenuItems.push({ label: 'Add Product', action: () => navigate('/products') });
    }

    const isActive = (path: string) => location.pathname === path;

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
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                                ) : (
                                    <Command size={22} strokeWidth={3} />
                                )}
                            </div>
                            <div className="flex items-baseline gap-1.5 min-w-0">
                                <div className="font-extrabold text-[15px] text-slate-800 tracking-tight truncate leading-none">{effectiveCompanyName}</div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60 flex-shrink-0">{effectivePlan}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-11 h-11 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-black text-base shadow-md mx-auto overflow-hidden">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                            ) : (
                                <Command size={22} strokeWidth={3} />
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 scrollbar-hide pb-8">
                    {navigationSections.map((section, sectionIdx) => (
                        <div key={sectionIdx} className="mb-6 last:mb-0">
                            {section.title && !isSidebarCollapsed && (
                                <div className="px-3 mb-2 mt-2">
                                    <h3 className="text-[10px] font-black text-slate-200  opacity-80" style={{ fontFamily: 'var(--font-display)' }}>
                                        {section.title}
                                    </h3>
                                </div>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const active = isActive(item.path);
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
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
                                                <Icon
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
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom Footer */}
                <div className="p-4 border-t border-[var(--color-border-light)] mt-auto bg-slate-50/30">
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-error font-extrabold hover:bg-red-50 group transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={18} strokeWidth={3} />
                        {!isSidebarCollapsed && <span className="text-[11px] font-black uppercase tracking-widest leading-none">Sign Out</span>}
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
                {/* Hero Background Decoration (Consistent with SuperAdmin) */}
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
                                placeholder="Global Search..."
                                className="w-full h-10 pl-11 pr-4 bg-white/10 border border-white/20 rounded-xl text-sm font-medium text-white placeholder:text-white/60 focus:bg-white/20 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationBell />

                        <div className="h-8 w-px bg-white/20 mx-2 hidden md:block" />

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="h-10 px-3 flex items-center gap-3 rounded-xl hover:bg-white/10 transition-all active:scale-95 text-white"
                            >
                                <div className="hidden md:flex flex-col items-end leading-none">
                                    <p className="text-sm font-bold">{user?.name || 'User'}</p>
                                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{user?.role || 'Member'}</p>
                                </div>
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md overflow-hidden ring-2 ring-white/30">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={16} />
                                    )}
                                </div>
                                <ChevronDown size={14} className="opacity-60" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide relative z-10 mt-4">
                    <div className="max-w-[1600px] mx-auto animate-fade-in">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
