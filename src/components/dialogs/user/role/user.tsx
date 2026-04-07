"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/utils/apiUtils";
import { Endpoint } from "@/constants/route";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";

interface Role {
  id: string;
  role: string;
}

interface UserRole {
  us_fk_id: string;
  email: string;
  roles: string;
}

interface UserRoleFormData {
  roleIds: string[];
}

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userRole: UserRole | null;
}

export function UserRoleDialog({ open, onOpenChange, onSuccess, userRole }: UserRoleDialogProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const pendingSubmitRef = useRef<UserRoleFormData | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<UserRoleFormData>({
    defaultValues: {
      roleIds: [],
    },
  });

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.role,
  }));

  useEffect(() => {
    if (open && userRole) {
      setIsLoadingRoles(true);
      apiFetch(Endpoint.ROLE)
        .then((response) => {
          if (response.payload) {
            const roleList = response?.payload || [];
            setRoles(roleList);
            const currentRoleNames = userRole.roles.split(",").map((r) => r.trim()).filter(Boolean);
            const filteredRoles = roleList.filter((role: Role) =>
              currentRoleNames.includes(role.role)
            );
            reset({
              roleIds: filteredRoles.map((role: Role) => role.id),
            });
          }
        })
        .catch(() => toast.error("Failed to load roles"))
        .finally(() => setIsLoadingRoles(false));
    }
  }, [open, userRole, reset]);

  const submitUserRoleUpdate = async (data: UserRoleFormData, ignoreKey: boolean = false) => {
    if (!userRole) return null;

    const currentRoleNames = userRole.roles.split(",").map((r) => r.trim()).filter(Boolean);
    const prevRoleIds = roles
      .filter((role) => currentRoleNames.includes(role.role))
      .map((role) => role.id);

    const isSimilar = (a: string, b: string) => a === b;
    const onlyInLeft = <T,>(left: T[], right: T[], compareFn: (a: T, b: T) => boolean): T[] => {
      return left.filter((a) => !right.some((b) => compareFn(a, b)));
    };

    const removedRoles = onlyInLeft(prevRoleIds, data.roleIds, isSimilar);
    const addedRoles = onlyInLeft(data.roleIds, prevRoleIds, isSimilar);

    if (removedRoles.length === 0 && addedRoles.length === 0) {
      return { info: "No changes detected" };
    }

    const mapping = data.roleIds.map((roleId) => ({
      user_fk_id: userRole.us_fk_id,
      role_fk_id: roleId,
    }));

    const body: any = { mapping };
    if (ignoreKey) {
      body.IGNORE_KEY = "EDIT_USER_ROLEE_MAPPING";
    }

    const response = await apiFetch(Endpoint.USER_ROLE_MAPPING, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return response;
  };

  const executeSubmit = async (data: UserRoleFormData, ignoreKey: boolean = false) => {
    try {
      const response = await submitUserRoleUpdate(data, ignoreKey);
      if (response) {
        handleResponse(response);
      }
    } catch (error) {
      toast.error("An error occurred while updating user roles");
    }
  };

  const handleResponse = (response: any) => {
    if (response.info) {
      toast.info(response.info);
      return;
    }
    if (response.message && !response.errors) {
      toast.success(response.message);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } else if (response.errors?.no) {
      toast.info(response.errors.no);
      onOpenChange(false);
    } else {
      const message = response.message || "Failed to update user roles";
      toast.error(message);
    }
  };

  const onSubmit = async (data: UserRoleFormData) => {
    try {
      const response = await submitUserRoleUpdate(data, false);

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
              onOpenChange(false);
            },
          },
        });
        return;
      }

      if (response) {
        handleResponse(response);
      }
    } catch (error) {
      toast.error("An error occurred while updating user roles");
    }
  };

  if (!userRole) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update User Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roles">Roles</Label>
              <Controller
                name="roleIds"
                control={control}
                rules={{ required: "At least one role is required" }}
                render={({ field }) => (
                  <MultiSelect
                    options={roleOptions}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder={isLoadingRoles ? "Loading roles..." : "Select roles"}
                    disabled={isLoadingRoles || isSubmitting}
                  />
                )}
              />
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

export default UserRoleDialog;