import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../../types';

interface SuperAdminGuardProps {
    user: User | null;
    children: React.ReactNode;
}

export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({ user, children }) => {
    // Platform Owner Email - In a real app, this would be a 'role' field in Firestore
    const SUPER_ADMIN_EMAILS = ['muneeswaran@averqon.in', 'clintan@averqon.in'];

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!SUPER_ADMIN_EMAILS.includes(user.email)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
