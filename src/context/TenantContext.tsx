import React, { createContext, useContext, useState, useEffect } from 'react';
import { tenantService } from '../services/firebaseService';
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
        const detectTenant = async () => {
            try {
                const hostname = window.location.hostname;
                const detectedTenant = await tenantService.getTenantByHostname(hostname);
                setTenant(detectedTenant);
            } catch (error) {
                console.error('Failed to detect tenant:', error);
            } finally {
                setLoading(false);
            }
        };

        detectTenant();
    }, []);

    // Helper to check if we are on a custom domain or subdomain
    const isWhiteLabeled = !!tenant;
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
