import { useState, useCallback } from "react";
import { apiFetch, ApiError } from "@/utils/apiUtils";
import { Endpoint } from "@/constants/route";
import { toast } from "sonner";

interface MutationOptions<T, R> {
  endpoint: Endpoint;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  onSuccess?: (response: R) => void;
  onError?: (error: ApiError) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface MutationState<T> {
  isLoading: boolean;
  error: ApiError | null;
}

export function useMutation<T = unknown, R = unknown>({
  endpoint,
  method,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: MutationOptions<T, R>) {
  const [state, setState] = useState<MutationState<T>>({
    isLoading: false,
    error: null,
  });

  const mutate = useCallback(
    async (body?: T): Promise<R | null> => {
      setState({ isLoading: true, error: null });

      try {
        const response = await apiFetch<R>(endpoint, {
          method,
          body: body ? JSON.stringify(body) : undefined,
        });

        if (successMessage) {
          toast.success(successMessage);
        }

        onSuccess?.(response);
        setState({ isLoading: false, error: null });
        return response;
      } catch (error) {
        const apiError =
          error instanceof ApiError
            ? error
            : new ApiError(500, "Unknown error");

        if (errorMessage) {
          toast.error(apiError.message || errorMessage);
        }

        onError?.(apiError);
        setState({ isLoading: false, error: apiError });
        return null;
      }
    },
    [endpoint, method, onSuccess, onError, successMessage, errorMessage]
  );

  return { mutate, ...state };
}
