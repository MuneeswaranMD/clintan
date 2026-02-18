import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

export interface Module {
    _id: string;
    key: string;
    name: string;
    path: string;
    icon: string;
    type: 'core' | 'extension';
    category: string;
    order: number;
}

export const useDynamicMenu = () => {
    const [menuItems, setMenuItems] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) {
                    // If no user is logged in, we might want to wait or return empty
                    // For now, assuming auth state is handled elsewhere
                    setLoading(false);
                    return;
                }

                const token = await user.getIdToken();

                // Adjust base URL as per your Vite config or environment
                // Check if running in development mode
                const isDev = import.meta.env.DEV;

                // If dev, prefer localhost. If prod, use VITE_API_URL or fallback.
                const API_URL = isDev
                    ? 'http://localhost:5000/api'
                    : (import.meta.env.VITE_API_URL || 'https://averqon-ay27.onrender.com/api');

                const response = await axios.get(`${API_URL}/menu`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMenuItems(response.data);
            } catch (err: any) {
                console.error('Failed to fetch dynamic menu:', err);
                setError(err.message || 'Failed to load menu');

                // Fallback for development/redesign preview if API fails (e.g. user not in DB)
                const fallbackModules: Module[] = [
                    { _id: '1', key: 'dashboard', name: 'Dashboard', path: '/super/dashboard', icon: 'LayoutDashboard', type: 'core', category: 'core', order: 0 },
                    { _id: '2', key: 'revenue', name: 'Revenue', path: '/super/revenue', icon: 'DollarSign', type: 'core', category: 'core', order: 1 },
                    { _id: '3', key: 'analytics', name: 'Analytics', path: '/super/analytics', icon: 'BarChart3', type: 'core', category: 'core', order: 2 },
                    { _id: '4', key: 'users', name: 'Users', path: '/super/users', icon: 'User', type: 'core', category: 'core', order: 3 },
                    { _id: '5', key: 'plans', name: 'Plans', path: '/super/plans', icon: 'CreditCard', type: 'core', category: 'core', order: 4 },
                    { _id: '6', key: 'modules', name: 'Modules', path: '/super/modules', icon: 'Package', type: 'core', category: 'core', order: 5 },
                    { _id: '7', key: 'tenants', name: 'Tenants', path: '/super/tenants', icon: 'Users', type: 'core', category: 'core', order: 6 },
                    { _id: '8', key: 'settings', name: 'Settings', path: '/super/settings', icon: 'Settings', type: 'core', category: 'core', order: 7 },
                    { _id: '9', key: 'notifications', name: 'Notifications', path: '/super/notifications', icon: 'Bell', type: 'core', category: 'core', order: 8 },
                    { _id: '10', key: 'branches', name: 'Branches', path: '/super/branches', icon: 'MapPin', type: 'core', category: 'core', order: 9 },
                    { _id: '11', key: 'comms', name: 'Communication', path: '/super/comms', icon: 'MessageSquare', type: 'core', category: 'core', order: 10 },
                    { _id: '12', key: 'automation', name: 'Automation', path: '/super/automation', icon: 'Zap', type: 'core', category: 'core', order: 11 },
                    { _id: '13', key: 'logs', name: 'Logs', path: '/super/logs', icon: 'Activity', type: 'core', category: 'core', order: 12 },
                ];
                setMenuItems(fallbackModules);
            } finally {
                setLoading(false);
            }
        };

        // Listen for auth state changes to re-fetch menu if user logs in
        const auth = getAuth();
        const unsubscribe = auth.onIdTokenChanged(async (user) => {
            if (user) {
                fetchMenu();
            } else {
                setMenuItems([]);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return { menuItems, loading, error };
};
