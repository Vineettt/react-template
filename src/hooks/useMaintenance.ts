import { useState, useEffect, useCallback } from "react";
import { apiFetch, ApiError } from "@/utils/apiUtils";
import { Endpoint } from "@/constants/route";

interface MaintenanceState {
  isMaintenanceMode: boolean;
  isChecking: boolean;
  error: string | null;
  retry: () => void;
}

export const useMaintenance = (): MaintenanceState => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkServerStatus = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await apiFetch<{ message: string; maintenance?: boolean }>(Endpoint.HEALTH || "health");

      if (response.maintenance === true) {
        setIsMaintenanceMode(true);
        setError(response.message || "Server is under maintenance");
      } else {
        setIsMaintenanceMode(false);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          setIsMaintenanceMode(false);
        } else {
          setIsMaintenanceMode(true);
          setError(err.message || "Server is temporarily unavailable");
        }
      } else {
        setIsMaintenanceMode(true);
        setError("Unable to connect to server. Please check your connection.");
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkServerStatus();
  }, [checkServerStatus]);

  return {
    isMaintenanceMode,
    isChecking,
    error,
    retry: checkServerStatus,
  };
};
