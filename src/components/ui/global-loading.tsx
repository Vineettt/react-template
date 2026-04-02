"use client";

import { LoadingSpinner } from "./loading-spinner";
import { Card } from "./card";

interface GlobalLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function GlobalLoading({ 
  message = "Loading...", 
  size = "lg" 
}: GlobalLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-sm w-full p-8 text-center">
        <div className="mx-auto">
          <LoadingSpinner size={size} />
        </div>
        <p className="mt-4 text-muted-foreground">{message}</p>
      </Card>
    </div>
  );
}

// Hook for easy access to global loading state
export function useGlobalLoading() {
  return GlobalLoading;
}
