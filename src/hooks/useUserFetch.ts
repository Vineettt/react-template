import { useCallback } from "react";
import { apiFetch, ApiError } from "@/utils/apiUtils";
import { Endpoint } from "@/constants/route";
import { logger } from "@/utils/logger";

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_status: string;
  [key: string]: unknown;
}

interface RoleData {
  id: string;
  role: string;
}

interface UserResponse {
  user: UserData;
  roles: RoleData[];
  id: string;
  permissions: string[];
}

export const useUserFetch = () => {
  const fetchUser = useCallback(async (): Promise<UserResponse | null> => {
    try {
      const response = await apiFetch<UserResponse>(Endpoint.USER);

      if (response.user) {
        return response;
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (err) {
      let errorMessage = "Failed to fetch user data";

      if (err instanceof ApiError) {
        errorMessage = `Failed to fetch user: ${err.status}`;
        if (err.status !== 401 && err.status !== 403) {
          logger.error("User fetch error:", errorMessage);
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
        logger.error("User fetch error:", errorMessage);
      }

      return null;
    }
  }, []);

  return { fetchUser };
};
