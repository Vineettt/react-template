import { FieldValues, UseFormSetError } from "react-hook-form";

interface ApiResponseWithErrors {
  errors?: Record<string, string>;
  message?: string;
}

export function mapApiErrorsToForm<T extends FieldValues>(
  response: ApiResponseWithErrors,
  setError: UseFormSetError<T>,
  validFields: readonly string[] = [],
  toastError?: (message: string) => void
): boolean {
  if (!response.errors) return false;

  let hasErrors = false;

  Object.entries(response.errors).forEach(([field, message]) => {
    if (validFields.length === 0 || validFields.includes(field)) {
      setError(field as any, { message: String(message) });
      hasErrors = true;
    }
  });

  if (hasErrors && toastError) {
    toastError(response.message || "Please fix the errors and try again");
  }

  return hasErrors;
}
