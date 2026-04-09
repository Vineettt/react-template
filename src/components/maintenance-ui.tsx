"use client";

import { useEffect } from "react";
import { useMaintenanceStore } from "@/stores/maintenanceStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wrench } from "lucide-react";

export function MaintenanceUI({ children }: { children: React.ReactNode }) {
  const { isMaintenanceMode, isChecking, error, checkServerStatus } = useMaintenanceStore();

  useEffect(() => {
    const controller = new AbortController();
    checkServerStatus(controller.signal);
    return () => controller.abort();
  }, [checkServerStatus]);

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

  return <>{children}</>;
}
