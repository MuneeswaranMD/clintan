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
  Building2
} from 'lucide-react';
import { User } from '../types';

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
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Estimates', path: '/estimates', icon: ClipboardList },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Recurring', path: '/recurring', icon: Repeat },
    { label: 'Checkouts', path: '/checkouts', icon: LayoutGrid },
    { label: 'Overdue', path: '/overdue', icon: Clock },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Products', path: '/products', icon: Package },
  ];

  // Super Admin Access
  if (user && user.email === 'muneeswaran@averqon.in') {
    if (!navItems.find(item => item.path === '/companies')) {
      navItems.unshift({ label: 'Companies', path: '/companies', icon: Building2 });
    }
  }

  React.useEffect(() => {
    const currentNavItem = navItems.find(item => item.path === location.pathname);
    const pageLabel = currentNavItem ? currentNavItem.label : 'CRM';
    const effectiveCompanyName = user.email === 'muneeswaran@averqon.in' ? 'Averqon' : (dbCompanyName || user.name);
    document.title = `${effectiveCompanyName} | ${pageLabel}`;
  }, [location.pathname, user, dbCompanyName]);

  const displayLogo = logoUrl || (user as any).photoURL || (user as any).logoUrl;

  return (
    <div className="flex h-screen bg-[#1D2125] overflow-hidden text-white font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1D2125] border-r border-gray-800 text-white transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {displayLogo ? (
                <img
                  src={displayLogo}
                  alt=""
                  className="h-8 w-8 object-contain"
                />
              ) : null}
              {user.email === 'muneeswaran@averqon.in' ? 'Averqon' : (dbCompanyName || user.name)}<span className="text-[#8FFF00]">.</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Workspace</p>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive
                      ? 'bg-[#8FFF00] text-black shadow-[0_0_15px_rgba(143,255,0,0.3)]'
                      : 'text-gray-400 hover:text-white hover:bg-[#2C3035]'}
                  `}
                >
                  <Icon size={20} className={isActive ? 'text-black' : 'group-hover:text-[#8FFF00] transition-colors'} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-[#2C3035] rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden border border-gray-500">
                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate text-white">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-800/50 mt-2"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header (Mobile) */}
        <header className="lg:hidden bg-[#1D2125] border-b border-gray-800 p-4 flex items-center justify-between z-40">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-400 hover:bg-gray-800 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            {displayLogo ? (
              <img
                src={displayLogo}
                alt=""
                className="h-6 w-6 object-contain"
              />
            ) : null}
            <span className="font-bold text-white">{user.email === 'muneeswaran@averqon.in' ? 'Averqon' : (dbCompanyName || user.name)}</span>
          </div>
          <div className="w-8" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#1D2125] p-4 lg:p-6 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};