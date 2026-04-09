"use client";

import { ReactNode, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProtectionProvider } from "@/contexts/AuthProtectionContext";
import { ConditionalSidebarWrapper } from "@/components/conditional-sidebar-wrapper";
import { MaintenanceUI } from "@/components/maintenance-ui";
import { useAuthStore } from "@/stores/authStore";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MaintenanceUI>
        <AuthProtectionProvider>
          <ConditionalSidebarWrapper>
            {children}
          </ConditionalSidebarWrapper>
        </AuthProtectionProvider>
      </MaintenanceUI>
    </ThemeProvider>
  );
}
