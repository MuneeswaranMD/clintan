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
    Shield
} from 'lucide-react';
import { User } from '../types';
import { NotificationBell } from './NotificationBell';
import { getFilteredNavItems } from '../config/navigationConfig';
import { useShop } from '../context/ShopContext';
import { GlobalCartDrawer } from './shop/GlobalCartDrawer';
import { FloatingCartButton } from './shop/FloatingCartButton';
import { BranchSelector } from './BranchSelector';
import { useNavigate } from 'react-router-dom';

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
            if (!user) return;
            try {
                const { companyService } = await import('../services/companyService');
                const company = await companyService.getCompanyByUserId(user.id);
                if (company) {
                    if ((company as any).logoUrl) {
                        setLogoUrl((company as any).logoUrl);
                    }
                    if ((company as any).name) {
                        setDbCompanyName((company as any).name);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch company details", error);
            }
        };
        fetchCompanyDetails();
    }, [user]);

    const handleCheckout = () => {
        navigate('/checkouts');
    };

    const effectiveCompanyName = user.email === 'muneeswaran@averqon.in' ? 'Averqon' : (dbCompanyName || user.name);

    const isSuperAdmin = user && user.email === 'muneeswaran@averqon.in';

    // Define navigation structure
    const navigationSections: NavSection[] = [
        {
            title: '',
            items: [
                { path: '/', label: 'Dashboard', icon: LayoutDashboard }
            ]
        },
        {
            title: 'Sales',
            items: [
                { path: '/orders', label: 'Orders', icon: ShoppingCart },
                { path: '/estimates', label: 'Estimates', icon: FileSpreadsheet },
                { path: '/invoices', label: 'Invoices', icon: FileText },
                { path: '/payments', label: 'Payments', icon: CreditCard },
                { path: '/overdue', label: 'Overdue', icon: Clock, badge: '3' }
            ]
        },
        {
            title: 'Business',
            items: [
                { path: '/customers', label: 'Customers', icon: Users },
                { path: '/products', label: 'Products', icon: Package },
                { path: '/expenses', label: 'Expenses', icon: DollarSign }
            ]
        },
        {
            title: 'Reports',
            items: [
                { path: '/reports', label: 'Reports', icon: BarChart3 },
                { path: '/analytics', label: 'Analytics', icon: TrendingUp }
            ]
        }
    ];

    // Add industry-specific modules dynamically
    if (businessConfig.industry === 'Retail') {
        navigationSections.push({
            title: 'Retail',
            items: [
                { path: '/pos', label: 'POS', icon: ShoppingBag },
                { path: '/inventory-logs', label: 'Inventory', icon: Warehouse }
            ]
        });
    }

    if (businessConfig.industry === 'Manufacturing' || businessConfig.features?.enableManufacturing) {
        navigationSections.push({
            title: 'Manufacturing',
            items: [
                { path: '/bom', label: 'Production', icon: Boxes },
                { path: '/purchase-orders', label: 'Purchase Orders', icon: FileText }
            ]
        });
    }

    if (businessConfig.industry === 'Service' || businessConfig.industry === 'Clinic') {
        navigationSections.push({
            title: 'Services',
            items: [
                { path: '/appointments', label: 'Appointments', icon: Calendar }
            ]
        });
    }
    // Settings section
    navigationSections.push({
        title: '',
        items: [
            { path: '/settings', label: 'Settings', icon: Settings }
        ]
    });

    if (isSuperAdmin) {
        navigationSections.push({
            title: 'Super Admin',
            items: [
                { path: '/super/dashboard', label: 'Control Center', icon: Shield },
                { path: '/companies', label: 'Companies', icon: Building2 },
                { path: '/saas-config', label: 'SaaS Config', icon: Settings }
            ]
        });
    }

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

    return (
        <div className="min-h-screen bg-[var(--color-bg-secondary)] flex overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50
                    bg-white border-r border-[var(--color-border)]
                    ${isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    transition-all duration-300 ease-[var(--transition-cubic)]
                    flex flex-col
                `}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-border-light)] bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    {!isSidebarCollapsed ? (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-200 active:scale-95 transition-transform">
                                A
                            </div>
                            <div className="flex flex-col">
                                <div className="font-bold text-sm text-slate-800 tracking-tight leading-none">Averqon Bills</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Enterprise</div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-11 h-11 bg-gradient-to-br from-[var(--color-primary)] to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-md mx-auto">
                            A
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
                    {navigationSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-8 last:mb-0">
                            {section.title && !isSidebarCollapsed && (
                                <div className="px-3 mb-3">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        {section.title}
                                    </h3>
                                </div>
                            )}
                            <div className="space-y-1.5">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;

                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileSidebarOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-xl
                                                transition-all duration-200 group relative
                                                ${isActive
                                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
                                                ${isSidebarCollapsed ? 'justify-center' : ''}
                                            `}
                                            title={isSidebarCollapsed ? item.label : undefined}
                                        >
                                            <Icon
                                                size={20}
                                                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                            {!isSidebarCollapsed && (
                                                <span className={`flex-1 text-sm font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-85'}`}>
                                                    {item.label}
                                                </span>
                                            )}
                                            {item.badge && !isSidebarCollapsed && (
                                                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                                                    {item.badge}
                                                </span>
                                            )}
                                            {isActive && (
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full shadow-lg shadow-blue-200" />
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-[var(--color-border-light)] bg-slate-50/50">
                    <div className={`
                        flex items-center gap-3 p-2 rounded-xl border border-transparent
                        hover:bg-white hover:border-slate-200 transition-all cursor-pointer group
                        ${isSidebarCollapsed ? 'justify-center' : ''}
                    `}>
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-xl flex items-center justify-center border border-blue-200 shadow-sm group-hover:scale-105 transition-transform">
                            <UserIcon size={18} className="text-blue-600" />
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-slate-800 truncate leading-none mb-1">
                                    {user.name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                                    {user.email.split('@')[0]}
                                </div>
                            </div>
                        )}
                    </div>
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
            <div className={`
                flex-1 flex flex-col min-h-screen
                ${isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}
                transition-all duration-300 ease-[var(--transition-cubic)]
            `}>
                {/* Top Navigation Bar */}
                <header className="h-16 flex items-center px-4 md:px-8 border-b border-[var(--color-border-light)] bg-white/70 backdrop-blur-xl sticky top-0 z-30">
                    {/* Left Section */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all md:hidden active:scale-90"
                        >
                            <Menu size={22} className="text-slate-600" />
                        </button>

                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all hidden md:block active:scale-90"
                        >
                            <Menu size={20} className="text-slate-500" />
                        </button>

                        <div className="relative hidden lg:block group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-80 h-10 pl-11 pr-4 bg-slate-100/50 border-none rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3 ml-auto">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 border-r border-slate-200 pr-3 mr-3 mobile-hide">
                            {user.allowedBranches && user.allowedBranches.length > 1 && (
                                <BranchSelector
                                    branches={user.allowedBranches}
                                    currentBranchId={user.branchId}
                                    onBranchChange={(branchId) => console.log(branchId)}
                                />
                            )}
                            <button
                                onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-md active:scale-95 text-sm font-bold"
                            >
                                <Plus size={18} strokeWidth={3} />
                                <span>Create</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <NotificationBell />

                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="w-10 h-10 p-0.5 rounded-xl border border-slate-200 hover:border-blue-400 transition-all active:scale-95 shadow-sm"
                                >
                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-50 rounded-[10px] flex items-center justify-center">
                                        <UserIcon size={20} className="text-blue-600" />
                                    </div>
                                </button>

                                {isProfileDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 animate-scale-in">
                                        <div className="px-3 py-3 border-b border-slate-100 mb-2">
                                            <div className="text-sm font-bold text-slate-800">{user.name}</div>
                                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.role}</div>
                                        </div>
                                        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-bold transition-all">
                                            <UserIcon size={18} /> Profile Settings
                                        </button>
                                        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-bold transition-all">
                                            <CreditCard size={18} /> Subscription
                                        </button>
                                        <div className="h-px bg-slate-100 my-2 mx-2" />
                                        <button
                                            onClick={onLogout}
                                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm font-bold transition-all"
                                        >
                                            <LogOut size={18} /> Logout Session
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
                    <div className="max-w-[1600px] mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

