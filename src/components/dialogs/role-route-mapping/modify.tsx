"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/utils/apiUtils";
import { Endpoint, HttpMethod } from "@/constants/route";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import { useMutation } from "@/hooks/useMutation";

interface Route {
  id: string;
  endpoint: string;
  method: string;
  handler: string;
}

interface Role {
  id: string;
  role: string;
}

interface RoleRouteMappingFormData {
  routeIds: string[];
}

interface RoleRouteMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  role?: Role | null;
  existingMappings?: string[];
}

export function RoleRouteMappingDialog({
  open,
  onOpenChange,
  onSuccess,
  role,
  existingMappings = [],
}: RoleRouteMappingDialogProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
  } = useForm<RoleRouteMappingFormData>({
    defaultValues: {
      routeIds: [],
    },
  });

  const routeIdsValue = watch("routeIds");

  useEffect(() => {
    if (open && role?.id) {
      setIsLoadingRoutes(true);
      const requestBody = { role: role.id };
      apiFetch(Endpoint.ROUTE, { method: HttpMethod.POST, body: JSON.stringify(requestBody) })
        .then((response) => {
          if (response.payload) {
            setRoutes(response.payload);
          }
        })
        .catch(() => toast.error("Failed to load routes"))
        .finally(() => setIsLoadingRoutes(false));

      reset({
        routeIds: existingMappings || [],
      });
    }
  }, [open, role?.id]);

  const routeOptions = routes.map((route) => ({
    value: route.id,
    label: `${route.endpoint} [${route.method}]`,
  }));

  const { mutate, isLoading } = useMutation<any, any>({
    endpoint: Endpoint.ROLE_ROUTE_MAPPING,
    method: "POST",
    onSuccess: (response) => {
      if (response?.message || response?.statusCode === 200 || response?.success) {
        toast.success(response.message || "Routes created successfully!");
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        const message = response.message || "Failed to create routes";
        toast.error(message);
      }
    },
    onError: () => {
      toast.error("An error occurred while creating routes");
    }
  });

  const onSubmit = (data: RoleRouteMappingFormData) => {
    if (!role) return;

    const mappingArray = data.routeIds.map((routeId) => ({
      route_id: routeId,
      role_id: role?.id,
    }));

    const body = {
      mapping: mappingArray,
    };

    mutate(body);
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modify Role Route Mapping</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 py-4">
            <div className="text-sm text-muted-foreground mb-2">
              Role: <strong>{role.role}</strong>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="routes">Routes</Label>
              <Controller
                name="routeIds"
                control={control}
                rules={{ required: "At least one route is required" }}
                render={({ field }) => (
                  <MultiSelect
                    options={routeOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder={isLoadingRoutes ? "Loading routes..." : "Select routes"}
                    disabled={isLoadingRoutes || isSubmitting}
                  />
                )}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || routeIdsValue.length === 0}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RoleRouteMappingDialog;
