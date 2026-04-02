import { useCallback } from "react";
import { apiFetch, ApiError } from "@/utils/api";
import { Endpoint } from "@/constants/route";

interface User {
  user: any;
  roles: any;
  id: any;
  permissions: string[];
}

export const useUserFetch = () => {
  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await apiFetch<User>(Endpoint.USER);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user data');
      }
    } catch (err) {
      let errorMessage = 'Failed to fetch user data';
      
      if (err instanceof ApiError) {
        errorMessage = `Failed to fetch user: ${err.status}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.error('User fetch error:', errorMessage);
      return null;
    }
  }, []);

  return { fetchUser };
};
