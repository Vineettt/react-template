import { useRef, useCallback } from "react";
import { apiFetch, ApiError, getErrorMessage } from "@/utils/apiUtils";
import { Endpoint } from "@/constants/route";
import { toast } from "sonner";

interface UseMutationWithConfirmOptions<T, R> {
  endpoint: Endpoint;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  onSuccess?: (response: R) => void;
  onError?: (error: ApiError) => void;
  successMessage?: string;
  errorMessage?: string;
  warningMessage?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  deleteKey?: string; // "role_id", "mapping_id", etc.
  deleteWrapper?: string; // "roles", "mapping", etc.
}

interface MutationResponse<R> {
  warnings?: { message?: string; IGNORE_KEY?: string };
  message?: string;
  errors?: Record<string, string>;
  info?: string;
  statusCode?: number;
  success?: boolean;
  [key: string]: unknown;
}

export function useMutationWithConfirm<T = unknown, R = unknown>({
  endpoint,
  method,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  warningMessage = "Warning: Proceed with caution",
  confirmLabel = "Yes",
  cancelLabel = "No",
  deleteKey,
  deleteWrapper,
}: UseMutationWithConfirmOptions<T, R>) {
  const pendingMutationRef = useRef<{ data: T; ignoreKey?: string } | null>(null);

  const executeMutation = useCallback(
    async (data: T, ignoreKey?: string) => {
      let body: unknown = data;
      
      if (method === "DELETE" && deleteKey && deleteWrapper && typeof data === "string") {
        body = {
          [deleteWrapper]: [{ [deleteKey]: data }],
        };
      }
      
      // Add IGNORE_KEY for confirmation
      if (ignoreKey) {
        if (typeof body === 'object' && body !== null) {
          body = { ...body, IGNORE_KEY: ignoreKey };
        }
      }

      return await apiFetch<MutationResponse<R>>(endpoint, {
        method,
        body: JSON.stringify(body as object),
      });
    },
    [endpoint, method, deleteKey, deleteWrapper]
  );

  const mutate = useCallback(
    async (data: T): Promise<void> => {
      try {
        const response = await executeMutation(data);

        if (response?.info) {
          toast.info(response.info);
          return;
        }

        if (response?.warnings) {
          pendingMutationRef.current = { data, ignoreKey: response.warnings.IGNORE_KEY };

          toast.warning(response.warnings.message || warningMessage, {
            duration: 10000,
            action: {
              label: confirmLabel,
              onClick: async () => {
                if (pendingMutationRef.current) {
                  try {
                    const confirmResponse = await executeMutation(
                      pendingMutationRef.current.data,
                      pendingMutationRef.current.ignoreKey
                    );
                    
                    if (confirmResponse?.info) {
                      toast.info(confirmResponse.info);
                      return;
                    }
                    
                    if (successMessage) {
                      toast.success(successMessage);
                    }
                    
                    onSuccess?.(confirmResponse as R);
                  } catch (error) {
                    const apiError =
                      error instanceof ApiError
                        ? error
                        : new ApiError(500, "Unknown error");

                    toast.error(getErrorMessage(apiError) || errorMessage || "An error occurred");

                    onError?.(apiError);
                  }
                  pendingMutationRef.current = null;
                }
              },
            },
            cancel: {
              label: cancelLabel,
              onClick: () => {
                pendingMutationRef.current = null;
              },
            },
          });
          return;
        }

        if (successMessage || response?.message || response?.statusCode === 200 || response?.success) {
          toast.success(response?.message || successMessage);
        }

        onSuccess?.(response as R);
      } catch (error) {
        const apiError =
          error instanceof ApiError
            ? error
            : new ApiError(500, "Unknown error");

        toast.error(getErrorMessage(apiError) || errorMessage || "An error occurred");

        onError?.(apiError);
      }
    },
    [executeMutation, onSuccess, onError, successMessage, errorMessage, warningMessage, confirmLabel, cancelLabel]
  );

  return { mutate };
}
