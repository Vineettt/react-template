"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useAppLoad } from "@/hooks/useAppload";
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
    const { loading } = useAuth();
    const { loadUser, logout, loggedIn } = useAppLoad();
    const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

    useEffect(() => {
        if (loading) return;
        if (!pathname) return;

        const isLoggedIn = loggedIn();
        const user = loadUser();
        setIsCheckingPermissions(true);

        if (isLoggedIn && publicPaths.includes(pathname)) {
            router.push('/dashboard');
            return;
        }

        if (!isLoggedIn && !publicPaths.includes(pathname)) {
            router.push('/auth/login');
            return;
        }

        if (isLoggedIn && !publicPaths.includes(pathname)) {
            const hasPermission = checkUserPermissions(pathname, user?.permissions || []);
            if (!hasPermission) {
                router.push('/misc/permission-denied');
                return;
            }
        }

        if (isLoggedIn && pathname === '/') {
            router.push('/dashboard');
            return;
        }

        if (!isLoggedIn && pathname === '/') {
            router.push('/auth/login');
            return;
        }

        if (!isLoggedIn && pathname === '/misc/permission-denied') {
            router.push('/auth/login');
            return;
        }

        setIsCheckingPermissions(false);

    }, [pathname, loading, loggedIn, loadUser]);

    const handleLogout = () => {
        setIsCheckingPermissions(true);
        logout();
        router.push('/auth/login');
    };

    const checkPermission = (path: string): boolean => {
        const user = loadUser();
        return checkUserPermissions(path, user?.permissions || []);
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
