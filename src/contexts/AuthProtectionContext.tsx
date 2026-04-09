"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { checkUserPermissions } from "@/utils/permissionUtils";
import { publicPaths } from "@/constants/permission";

interface AuthProtectionType {
    canAccessPath: (path: string) => boolean;
    logout: () => void;
    isCheckingPermissions: boolean;
}

const AuthProtectionContext = createContext<AuthProtectionType | null>(null);

export function AuthProtectionProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { loading, permissions, logout: storeLogout, loggedIn } = useAuthStore();
    const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

    useEffect(() => {
        if (loading) return;
        if (!pathname) return;

        const isLoggedIn = loggedIn();

        if (!isLoggedIn && !publicPaths.includes(pathname) && pathname !== '/auth/login') {
            router.replace('/auth/login');
            return;
        }

        if (isLoggedIn && pathname === '/') {
            router.replace('/dashboard');
            return;
        }

        if (isLoggedIn && publicPaths.includes(pathname) && pathname !== '/dashboard') {
            router.replace('/dashboard');
            return;
        }

        setIsCheckingPermissions(false);

    }, [pathname, loading, loggedIn]);

    const handleLogout = () => {
        storeLogout();
        router.replace('/auth/login');
    };

    const checkPermission = (path: string): boolean => {
        return checkUserPermissions(path, permissions || []);
    };

    return (
        <AuthProtectionContext.Provider value={{
            canAccessPath: checkPermission,
            logout: handleLogout,
            isCheckingPermissions
        }}>
            {children}
        </AuthProtectionContext.Provider>
    );
}

export function useAuthProtection() {
    const context = useContext(AuthProtectionContext);
    if (!context) {
        throw new Error('useAuthProtection must be used within an AuthProtectionProvider. Please wrap your component with AuthProtectionProvider.');
    }
    return context;
}

export function usePermissionCheck(path: string): boolean {
    const { canAccessPath } = useAuthProtection();
    return canAccessPath(path);
}

export function useLogout() {
    const { logout } = useAuthProtection();
    return { logout };
}

export function useCurrentPathPermissions() {
    const { canAccessPath } = useAuthProtection();
    return canAccessPath(typeof window !== 'undefined' ? window.location.pathname : '/');
}
