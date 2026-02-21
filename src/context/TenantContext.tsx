import React, { createContext, useContext, useState, useEffect } from 'react';
import { tenantService } from '../services/firebaseService';
import { authService } from '../services/authService';
import { Tenant } from '../types';

interface TenantContextType {
    tenant: Tenant | null;
    loading: boolean;
    isWhiteLabeled: boolean;
    isVerified: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Initial detection by hostname
        const detectTenant = async () => {
            try {
                const hostname = window.location.hostname;
                const detectedTenant = await tenantService.getTenantByHostname(hostname);
                if (detectedTenant) {
                    setTenant(detectedTenant);
                    setLoading(false);
                    return; // Domain-based tenant takes precedence
                }
            } catch (error) {
                console.error('Failed to detect tenant by hostname:', error);
            }
        };

        detectTenant();

        // 2. Auth-based tenant subscription
        let tenantUnsubscribe: (() => void) | undefined;

        const authUnsubscribe = authService.onAuthStateChange((user) => {
            if (tenantUnsubscribe) {
                tenantUnsubscribe();
                tenantUnsubscribe = undefined;
            }

            if (user) {
                tenantUnsubscribe = tenantService.subscribeToTenantByUserId(user.id, (data) => {
                    if (data) {
                        setTenant(data);
                    }
                    setLoading(false);
                });
            } else {
                // Keep domain-based tenant if present, otherwise clear
                // But usually if logged out, we might want to clear it unless on a custom domain
                const hostname = window.location.hostname;
                if (!hostname.includes('localhost') && !hostname.includes('averqon')) {
                    // Stay on domain-based tenant
                } else {
                    setTenant(null);
                }
                setLoading(false);
            }
        });

        return () => {
            authUnsubscribe();
            if (tenantUnsubscribe) tenantUnsubscribe();
        };
    }, []);

    // Apply branding colors dynamically
    useEffect(() => {
        if (tenant?.config?.branding) {
            const { primaryColor, secondaryColor } = tenant.config.branding;
            const root = document.documentElement;

            if (primaryColor) {
                root.style.setProperty('--color-primary', primaryColor);
            }

            if (secondaryColor) {
                root.style.setProperty('--color-secondary', secondaryColor);
                // Also update the secondary text or highlight color for legacy components
                root.style.setProperty('--color-text-secondary', secondaryColor);
            }
        }
    }, [tenant]);

    // Helper to check if we are on a custom domain or subdomain
    const isWhiteLabeled = !!tenant && window.location.hostname !== 'localhost' && !window.location.hostname.includes('averqon');
    const isVerified = tenant?.config?.verification?.status === 'Verified';

    return (
        <TenantContext.Provider value={{ tenant, loading, isWhiteLabeled, isVerified }}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-slate-900">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <p className="text-white font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Platform Environment...</p>
                    </div>
                </div>
            ) : (
                children
            )}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};
