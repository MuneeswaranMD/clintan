import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
    roles: UserRole[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: string;
    currentUserRole?: UserRole;
}

/**
 * RoleGuard - Protects routes based on user role
 * 
 * Usage:
 * <RoleGuard roles={['COMPANY_ADMIN', 'ACCOUNTANT']}>
 *   <FinancePage />
 * </RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
    roles,
    children,
    fallback,
    redirectTo = '/',
    currentUserRole
}) => {
    // TODO: Get actual user role from AuthContext when implemented
    // For now, we'll use a placeholder
    const userRole = currentUserRole || 'COMPANY_ADMIN';

    const hasAccess = roles.includes(userRole);

    if (!hasAccess) {
        if (redirectTo) {
            return <Navigate to={redirectTo} replace />;
        }

        return fallback || (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Access Denied</h2>
                    <p className="text-slate-500 mb-6">
                        You don't have permission to access this page.
                    </p>
                    <p className="text-sm text-slate-400">
                        Required role: <span className="font-bold text-slate-700">{roles.join(' or ')}</span>
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                        Your role: <span className="font-bold text-slate-700">{userRole}</span>
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

/**
 * Role check hook
 * 
 * Usage:
 * const isAdmin = useRole(['COMPANY_ADMIN', 'SUPER_ADMIN']);
 * {isAdmin && <AdminButton />}
 */
export const useRole = (roles: UserRole[], currentUserRole?: UserRole): boolean => {
    // TODO: Get actual user role from AuthContext when implemented
    const userRole = currentUserRole || 'COMPANY_ADMIN';
    return roles.includes(userRole);
};

/**
 * Role definitions and permissions
 */
export const ROLE_PERMISSIONS = {
    SUPER_ADMIN: {
        label: 'Super Admin',
        description: 'Platform owner with full access',
        canAccessCompanies: true,
        canAccessPlatformConfig: true,
        canManageUsers: true,
        canManageBranches: true,
        canViewFinancials: true,
        canManageInventory: true
    },
    COMPANY_ADMIN: {
        label: 'Company Admin',
        description: 'Company owner with full company access',
        canAccessCompanies: false,
        canAccessPlatformConfig: false,
        canManageUsers: true,
        canManageBranches: true,
        canViewFinancials: true,
        canManageInventory: true
    },
    BRANCH_MANAGER: {
        label: 'Branch Manager',
        description: 'Branch-level management access',
        canAccessCompanies: false,
        canAccessPlatformConfig: false,
        canManageUsers: false,
        canManageBranches: false,
        canViewFinancials: true,
        canManageInventory: true
    },
    ACCOUNTANT: {
        label: 'Accountant',
        description: 'Financial operations access',
        canAccessCompanies: false,
        canAccessPlatformConfig: false,
        canManageUsers: false,
        canManageBranches: false,
        canViewFinancials: true,
        canManageInventory: false
    },
    SALES: {
        label: 'Sales',
        description: 'Sales and customer management',
        canAccessCompanies: false,
        canAccessPlatformConfig: false,
        canManageUsers: false,
        canManageBranches: false,
        canViewFinancials: false,
        canManageInventory: false
    },
    WAREHOUSE: {
        label: 'Warehouse',
        description: 'Inventory and stock management',
        canAccessCompanies: false,
        canAccessPlatformConfig: false,
        canManageUsers: false,
        canManageBranches: false,
        canViewFinancials: false,
        canManageInventory: true
    },
    VIEWER: {
        label: 'Viewer',
        description: 'Read-only access',
        canAccessCompanies: false,
        canAccessPlatformConfig: false,
        canManageUsers: false,
        canManageBranches: false,
        canViewFinancials: false,
        canManageInventory: false
    }
};
