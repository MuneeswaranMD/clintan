import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Package,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  CreditCard,
  Repeat,
  LayoutGrid,
  ClipboardList,
  Clock,
  Users,
  Building2,
  Search,
  Bell,
  Settings,
  TrendingUp,
  Plus,
  HelpCircle,
  ChevronDown,
  ShoppingBag,
  PackageOpen,
  Truck,
  Activity
} from 'lucide-react';
import { User } from '../types';
import { NotificationBell } from './NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [dbCompanyName, setDbCompanyName] = React.useState<string | null>(null);
  const location = useLocation();

  React.useEffect(() => {
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

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Analytics', path: '/analytics', icon: TrendingUp },
    { label: 'Business Intelligence', path: '/advanced-analytics', icon: Activity },
    { label: 'Estimates', path: '/estimates', icon: ClipboardList },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Orders', path: '/orders', icon: ShoppingBag },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Recurring', path: '/recurring', icon: Repeat },
    { label: 'Checkouts', path: '/checkouts', icon: LayoutGrid },
    { label: 'Overdue', path: '/overdue', icon: Clock },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Purchase Orders', path: '/purchase-orders', icon: Truck },
    { label: 'Inventory', path: '/inventory-logs', icon: PackageOpen },
    { label: 'Suppliers', path: '/suppliers', icon: Building2 },
  ];

  if (user && user.email === 'muneeswaran@averqon.in') {
    if (!navItems.find(item => item.path === '/companies')) {
      navItems.unshift({ label: 'Companies', path: '/companies', icon: Building2 });
    }
  }

  const effectiveCompanyName = user.email === 'muneeswaran@averqon.in' ? 'Averqon' : (dbCompanyName || user.name);
  const displayLogo = logoUrl || (user as any).photoURL || (user as any).logoUrl;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Header Row */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
                A
              </div>
              <span className="text-xl font-bold text-slate-800 hidden sm:block tracking-tight">
                Averqon <span className="text-blue-600">Bills</span>
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <span className="text-sm font-bold text-slate-700">{user.name}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <LayoutGrid size={16} className="text-blue-600" />
              <span className="text-sm font-bold text-slate-700">{effectiveCompanyName}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>

          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 outline-none focus:bg-white focus:border-blue-600 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <NavLink
              to="/settings"
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <Settings size={20} />
            </NavLink>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-2 mr-2 hidden sm:flex">
              <div className="w-10 h-5 bg-slate-200 rounded-full p-0.5 cursor-pointer relative transition-colors hover:bg-slate-300">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise</span>
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100 text-sm whitespace-nowrap">
              <Plus size={18} />
              <span className="hidden sm:inline">Action</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tier */}
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 border-t border-slate-100">
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 relative whitespace-nowrap
                    ${isActive
                      ? 'text-blue-600 bg-blue-50/50'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                  `}
                >
                  <Icon size={16} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          {children}

          {/* Floating AI Assistant (Optional, matches image) */}
          <button className="fixed bottom-8 right-8 bg-white border border-gray-200 shadow-2xl rounded-full px-4 py-2.5 flex items-center gap-2 hover:scale-105 transition-transform z-50">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <HelpCircle size={14} className="text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-gray-700">AI Assistant</span>
          </button>
        </div>
      </main>
    </div>
  );
};