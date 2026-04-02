"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
    const { logout, loggedIn, loadUser } = useAppLoad();
    const user = loadUser();
    const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

    const handleLogout = () => {
        setIsCheckingPermissions(true);
        logout();
        router.push('/auth/login');
    };

    const checkPermission = (path: string): boolean => {
        return checkUserPermissions(path, user?.permissions || []);
    };

    useEffect(() => {
        if (!pathname) return;

        if (loggedIn() && publicPaths.includes(pathname)) {
            setIsCheckingPermissions(true);
            router.push('/dashboard');
            return;
        }

        if (!loggedIn() && !publicPaths.includes(pathname)) {
            setIsCheckingPermissions(true);
            router.push('/auth/login');
            return;
        }

        if (loggedIn() && !publicPaths.includes(pathname)) {
            setIsCheckingPermissions(true);
            console.log('Checking permissions for:', pathname);
            console.log('User data:', user);
            console.log('User permissions:', user?.permissions);
            const hasPermission = checkPermission(pathname);
            console.log('hasPermission', hasPermission);
            if (!hasPermission) {
                router.push('/misc/permission-denied');
                return;
            }
            setIsCheckingPermissions(false);
        }

        if (loggedIn() && pathname === '/') {
            setIsCheckingPermissions(true);
            router.push('/dashboard');
        }

        if (!loggedIn() && pathname === '/') {
            setIsCheckingPermissions(true);
            router.push('/auth/login');
        }

        if (!loggedIn() && pathname === '/misc/permission-denied') {
            router.push('/auth/login');
        }

    }, [pathname, loggedIn, user]);

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
