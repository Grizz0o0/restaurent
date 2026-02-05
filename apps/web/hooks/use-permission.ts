import { useAuth } from './domain/use-auth';
import { useMemo } from 'react';

export const usePermission = () => {
    const { user } = useAuth();

    const permissions = useMemo(() => {
        return user?.role?.permissions || [];
    }, [user]);

    const hasPermission = (permissionPath: string) => {
        if (!user || !user.role) return false;
        // Admin has all permissions usually, but we check specific paths too.
        // If your logic usually gives Admin everything, check role name here:
        if (user.role.name === 'ADMIN') return true;

        return permissions.some((p: any) => {
            // Check exact match
            if (p.path === permissionPath) return true;
            // Check wildcard (e.g., 'orders.*' allows 'orders.create')
            if (p.path.endsWith('.*')) {
                const prefix = p.path.replace('.*', '');
                return permissionPath.startsWith(prefix);
            }
            return false;
        });
    };

    const hasRole = (roleName: string) => {
        return user?.role?.name === roleName;
    };

    return {
        permissions,
        hasPermission,
        hasRole,
        role: user?.role,
    };
};
