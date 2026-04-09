"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation } from "@/hooks/useMutation";
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
  const [pendingConfirmData, setPendingConfirmData] = useState<RoleFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<RoleFormData>({
    defaultValues: {
      role: "",
    },
  });

  const roleValue = watch("role");

  interface RoleResponse {
    warnings?: { message: string };
    message?: string;
  }

  const { mutate: submitRole } = useMutation<unknown, RoleResponse>({
    endpoint: Endpoint.ROLE,
    method: isEditing ? "PUT" : "POST",
    successMessage: `Role ${isEditing ? "updated" : "created"} successfully`,
    onSuccess: () => {
      reset();
      onOpenChange(false);
      onSuccess?.();
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        role: role?.role || "",
      });
    }
  }, [open, role, reset]);

  const executeSubmit = useCallback(async (data: RoleFormData, ignoreKey: boolean) => {
    const payload = isEditing
      ? { role: data.role, id: role?.id, ignore_key: ignoreKey ? "EDIT_ROLE" : undefined }
      : { role: data.role };

    await submitRole({ roles: [payload] });
    setPendingConfirmData(null);
  }, [isEditing, role?.id, submitRole]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const onSubmit = async (data: RoleFormData) => {
    if (isEditing && data.role === role?.role) {
      toast.info("No changes detected");
      onOpenChange(false);
      return;
    }

    const response = await submitRole({
      roles: [isEditing ? { role: data.role, id: role?.id } : { role: data.role }],
    });

    if (response?.warnings && isEditing) {
      setPendingConfirmData(data);
      toast.warning(response.warnings.message || "Warning: Proceed with caution", {
        duration: 10000,
        action: {
          label: "Yes",
          onClick: () => {
            executeSubmit(data, true);
          },
        },
        cancel: {
          label: "No",
          onClick: () => {
            setPendingConfirmData(null);
          },
        },
      });
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
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
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
