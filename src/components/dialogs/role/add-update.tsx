"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { mapApiErrorsToForm } from "@/utils/formErrorUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/utils/apiUtils";
import { Endpoint } from "@/constants/route";
import { toast } from "sonner";

interface Role {
  id: string;
  role: string;
}

interface RoleFormData {
  role: string;
}

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  role?: Role | null;
}

export function RoleDialog({ open, onOpenChange, onSuccess, role }: RoleDialogProps) {
  const isEditing = !!role;
  const pendingSubmitRef = useRef<RoleFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
  } = useForm<RoleFormData>({
    defaultValues: {
      role: "",
    },
  });

  const roleValue = watch("role");

  useEffect(() => {
    if (open) {
      reset({
        role: role?.role || "",
      });
    }
  }, [open, role, reset]);

  const submitRoleUpdate = async (data: RoleFormData, ignoreKey: boolean = false) => {
    const payload = isEditing
      ? { role: data.role, id: role?.id }
      : { role: data.role };

    const body: any = { roles: [payload] };
    if (ignoreKey && isEditing) {
      body.IGNORE_KEY = "EDIT_ROLE";
    }

    const response = await apiFetch(Endpoint.ROLE, {
      method: isEditing ? "PUT" : "POST",
      body: JSON.stringify(body),
    });

    return response;
  };

  const handleResponse = (response: any) => {
    if (response.message || response.statusCode === 200 || response.success) {
      toast.success(response.message || `Role ${isEditing ? "updated" : "created"} successfully!`);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } else {
      const hasFieldErrors = mapApiErrorsToForm(
        response,
        setError,
        ["role"],
        toast.error
      );

      if (!hasFieldErrors) {
        const message = response.message || `Failed to ${isEditing ? "update" : "create"} role`;
        toast.error(message);
        setError("root", { message });
      }
    }
  };

  const onSubmit = async (data: RoleFormData) => {
    try {
      if (isEditing && data.role === role?.role) {
        toast.info("No changes detected");
        onOpenChange(false);
        return;
      }

      const response = await submitRoleUpdate(data, false);

      if (response?.warnings && isEditing) {
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
      } else {
        handleResponse(response);
      }
    } catch (error) {
      toast.error(`An error occurred while ${isEditing ? "updating" : "creating"} role`);
    }
  };

  const executeSubmit = async (data: RoleFormData, ignoreKey: boolean) => {
    try {
      const response = await submitRoleUpdate(data, ignoreKey);
      handleResponse(response);
    } catch (error) {
      toast.error(`An error occurred while ${isEditing ? "updating" : "creating"} role`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Role" : "Add Role"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                type="text"
                placeholder="Role name"
                {...register("role", {
                  required: "Role is required",
                  minLength: {
                    value: 1,
                    message: "Role cannot be empty",
                  },
                })}
              />
              {errors.role && (
                <span className="text-sm text-red-500">{errors.role.message}</span>
              )}
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update" : "Add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RoleDialog;
