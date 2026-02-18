import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDynamicMenu } from '../../hooks/useDynamicMenu';
import * as Icons from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

const DynamicSidebar = () => {
    const { menuItems, loading } = useDynamicMenu();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <div className="w-64 h-screen bg-white border-r border-gray-200 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Group items by category if needed, or just map them
    // For this implementation, we render a flat list sorted by order (backend handles sorting)

    // Helper to resolve Lucide Icon string to component
    const getIcon = (iconName: string) => {
        // @ts-ignore - Lucide icons are dynamically accessed
        const IconComponent = Icons[iconName as keyof typeof Icons] || Icons.HelpCircle;
        return <IconComponent size={20} />;
    };

    return (
        <aside
            className={`bg-white h-screen border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                {!isCollapsed && (
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Clintan
                    </span>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                    {isCollapsed ? <Icons.Menu size={20} /> : <Icons.ChevronLeft size={20} />}
                </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.key}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center px-3 py-2.5 rounded-lg transition-colors group
              ${isActive
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
            `}
                    >
                        <span className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                            {getIcon(item.icon)}
                        </span>

                        {!isCollapsed && (
                            <span>{item.name}</span>
                        )}

                        {!isCollapsed && item.type === 'extension' && (
                            <span className="ml-auto text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium uppercase tracking-wider">
                                EXT
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''
                        }`}
                >
                    <Icons.LogOut size={20} className={isCollapsed ? '' : 'mr-3'} />
                    {!isCollapsed && "Sign Out"}
                </button>
            </div>
        </aside>
    );
};

export default DynamicSidebar;
