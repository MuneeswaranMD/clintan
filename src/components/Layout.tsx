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
  Activity,
  Sparkles,
  Shield
} from 'lucide-react';
import { User } from '../types';
import { NotificationBell } from './NotificationBell';
import { GlobalCartDrawer } from './shop/GlobalCartDrawer';
import { FloatingCartButton } from './shop/FloatingCartButton';
import { BranchSelector } from './BranchSelector';
import { useShop } from '../context/ShopContext';
import { getFilteredNavItems } from '../config/navigationConfig';
import { tenantService } from '../services/firebaseService';
import { HealthBadge } from './HealthBadge';


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
  }, [user]);

  const { mode, businessConfig } = useShop();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkouts');
  };

  // Dynamic navigation based on enabled features
  const isSuperAdmin = user && user.email === 'muneeswaran@averqon.in';
  const navItems = React.useMemo(() => {
    return getFilteredNavItems(businessConfig.features, isSuperAdmin);
  }, [businessConfig.features, isSuperAdmin]);

  const effectiveCompanyName = user.email === 'muneeswaran@averqon.in' ? 'Averqon' : (dbCompanyName || user.name);
  const displayLogo = logoUrl || (user as any).photoURL || (user as any).logoUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 flex flex-col font-sans text-slate-900">
      {/* Premium Top Header with Glassmorphism */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Premium Branding */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200/50 group-hover:shadow-xl group-hover:shadow-blue-300/50 transition-all group-hover:scale-105">
                    A
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      Averqon
                    </span>
                    <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      Bills
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider -mt-1">Business OS</p>
                </div>
              </div>

              {/* User & Company Pills */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 rounded-xl hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserIcon size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{user.name}</span>
                  <ChevronDown size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-y-0.5 transition-all" />
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-br from-blue-50/80 to-white border border-blue-200/80 rounded-xl hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                  <Building2 size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{effectiveCompanyName}</span>
                  <ChevronDown size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-y-0.5 transition-all" />
                </div>

                {/* Branch Selector */}
                {user.allowedBranches && user.allowedBranches.length > 1 && (
                  <BranchSelector
                    branches={user.allowedBranches}
                    currentBranchId={user.branchId}
                    onBranchChange={(branchId) => {
                      console.log('Branch changed to:', branchId);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Center: Premium Search */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" size={20} />
                <input
                  type="text"
                  placeholder="Search anything... (⌘K)"
                  className="w-full bg-slate-50/80 border-2 border-slate-200/80 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all text-sm font-medium placeholder:text-slate-400 hover:border-slate-300"
                />
              </div>
            </div>

            {/* Right: Premium Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <HealthBadge />
              </div>
              <NotificationBell />

              <NavLink
                to="/settings"
                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-105"
              >
                <Settings size={20} />
              </NavLink>

              {/* Super Admin Button - Only for muneeswaran@averqon.in */}
              {isSuperAdmin && (
                <NavLink
                  to="/super/dashboard"
                  className="relative group p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105"
                  title="Super Admin Control Center"
                >
                  <Shield size={20} className="relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity"></div>
                </NavLink>
              )}

              <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

              {/* Premium Plan Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border border-purple-200/60 rounded-full shadow-sm">
                <Sparkles size={12} className="text-purple-600" />
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">Enterprise</span>
              </div>

              <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-blue-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm whitespace-nowrap">
                <Plus size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">New</span>
              </button>

              <button
                onClick={onLogout}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Premium Navigation Pills */}
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 pb-4 pt-2">
          <div className="bg-slate-50/50 rounded-2xl p-2 border border-slate-200/60">
            <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`
                      group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50'
                        : 'text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-md'
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} transition-colors`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="tracking-wide">{item.label}</span>
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm"></div>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area with Premium Background */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      <FloatingCartButton currency="₹" />
      <GlobalCartDrawer
        currency="₹"
        onCheckout={handleCheckout}
      />
    </div>
  );
}