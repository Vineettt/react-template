"use client";

import { createContext, useContext, ReactNode } from "react";
import { useMaintenance } from "@/hooks/useMaintenance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wrench } from "lucide-react";

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  isChecking: boolean;
  error: string | null;
  retry: () => void;
}

export const MaintenanceContext = createContext<MaintenanceContextType | null>(null);

export function useMaintenanceContext() {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error("useMaintenanceContext must be used within MaintenanceProvider");
  }
  return context;
}

interface MaintenanceProviderProps {
  children: ReactNode;
}

export function MaintenanceProvider({ children }: MaintenanceProviderProps) {
  const { isMaintenanceMode, isChecking, error, retry } = useMaintenance();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Checking server...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isMaintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Wrench className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle>Maintenance</CardTitle>
            <CardDescription>
              {error || "Website is under maintenance. Please check after a while"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              It looks like you found a glitch in the matrix...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, isChecking, error, retry }}>
      {children}
    </MaintenanceContext.Provider>
  );
}
