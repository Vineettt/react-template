"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { mapApiErrorsToForm } from "@/utils/formErrorUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/utils/apiUtils";
import { Endpoint } from "@/constants/route";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Route {
  id: string;
  endpoint: string;
  handler: string;
  method: string;
}

interface HandlerOption {
  value: string;
  viewValue: string;
}

interface RouteFormData {
  handler: string;
}

interface UpdateRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  route?: Route | null;
}

export function UpdateRouteDialog({ open, onOpenChange, onSuccess, route }: UpdateRouteDialogProps) {
  const [handlers, setHandlers] = useState<HandlerOption[]>([]);
  const [isLoadingHandlers, setIsLoadingHandlers] = useState(false);
  const pendingSubmitRef = useRef<RouteFormData | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
  } = useForm<RouteFormData>({
    defaultValues: {
      handler: "",
    },
  });

  const handlerValue = watch("handler");

  useEffect(() => {
    if (open && route) {
      reset({
        handler: route.handler || "",
      });
    }
  }, [open, route, reset]);

  useEffect(() => {
    if (open) {
      setIsLoadingHandlers(true);
      apiFetch(Endpoint.HANDLER)
        .then((response) => {
          if (response.payload) {
            setHandlers(response.payload);
          }
        })
        .catch(() => toast.error("Failed to load handlers"))
        .finally(() => setIsLoadingHandlers(false));
    }
  }, [open]);

  const submitRouteUpdate = async (data: RouteFormData, ignoreKey: boolean = false) => {
    if (!route) return null;

    const payload = {
      routes: [{
        handler: data.handler,
        id: route.id,
      }],
    };

    const body: any = payload;
    if (ignoreKey) {
      body.IGNORE_KEY = "EDIT_ROUTE";
    }

    const response = await apiFetch(Endpoint.ROUTE, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return response;
  };

  const handleResponse = (response: any) => {
    if (response?.message || response?.statusCode === 200 || response?.success) {
      toast.success(response.message || "Route updated successfully!");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } else {
      const hasFieldErrors = mapApiErrorsToForm(
        response,
        setError,
        ["handler"],
        toast.error
      );

      if (!hasFieldErrors) {
        const message = response.message || "Failed to update route";
        toast.error(message);
        setError("root", { message });
      }
    }
  };

  const onSubmit = async (data: RouteFormData) => {
    if (!route) return;

    try {
      if (data.handler === route.handler) {
        toast.info("No changes detected");
        onOpenChange(false);
        return;
      }

      const response = await submitRouteUpdate(data, false);

      if (!response) return;

      if (response?.warnings) {
        pendingSubmitRef.current = data;
        toast.warning(response.warnings.message || "Warning: Proceed with caution", {
          duration: 10000,
          action: {
            label: "Yes",
            onClick: () => {
              if (pendingSubmitRef.current) {
                executeSubmit(pendingSubmitRef.current, true);
                pendingSubmitRef.current = null;
              }
            },
          },
          cancel: {
            label: "No",
            onClick: () => {
              pendingSubmitRef.current = null;
            },
          },
        });
        return;
      }

      handleResponse(response);
    } catch (error) {
      toast.error("An error occurred while updating route");
    }
  };

  const executeSubmit = async (data: RouteFormData, ignoreKey: boolean) => {
    try {
      const response = await submitRouteUpdate(data, ignoreKey);
      if (response) {
        handleResponse(response);
      }
    } catch (error) {
      toast.error("An error occurred while updating route");
    }
  };

  if (!route) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Route</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="handler">Handler</Label>
              <Controller
                name="handler"
                control={control}
                rules={{ required: "Handler is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoadingHandlers || isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingHandlers ? "Loading handlers..." : "Select handler"} />
                    </SelectTrigger>
                    <SelectContent>
                      {handlers.map((handler) => (
                        <SelectItem key={handler.value} value={handler.value}>
                          {handler.value || "None"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.handler && (
                <span className="text-sm text-red-500">{errors.handler.message}</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Endpoint: <strong>{route.endpoint}</strong> | Method: <strong>{route.method}</strong>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateRouteDialog;
