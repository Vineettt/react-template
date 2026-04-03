"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAppLoad } from "@/hooks/useAppload";
import { useUserFetch } from "@/hooks/useUserFetch";

interface AuthType {
    loading: boolean;
}

const AuthContext = createContext<AuthType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { loggedIn, storeUserData } = useAppLoad();
    const { fetchUser } = useUserFetch();
    const [loading, setLoading] = useState(true);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        const initializeAuth = async () => {
            if (!hasFetchedRef.current && loggedIn()) {
                hasFetchedRef.current = true;
                try {
                    const response = await fetchUser();
                    if (response && response.user) {
                        storeUserData(response.user);
                    }
                } catch (error) {
                    console.error('Auth initialization error:', error);
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider. Please wrap your component with AuthProvider.');
    }
    return context;
}