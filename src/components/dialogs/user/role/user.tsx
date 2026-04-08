"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/utils/apiUtils";
import { Endpoint } from "@/constants/route";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import { useMutationWithConfirm } from "@/hooks/useMutationWithConfirm";

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

  const { mutate } = useMutationWithConfirm<any, any>({
    endpoint: Endpoint.USER_ROLE_MAPPING,
    method: "PUT",
    onSuccess: (response) => {
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
    },
    onError: () => {
      toast.error("An error occurred while updating user roles");
    }
  });

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

  const onSubmit = (data: UserRoleFormData) => {
    if (!userRole) return;

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
      toast.info("No changes detected");
      return;
    }

    const mapping = data.roleIds.map((roleId) => ({
      user_fk_id: userRole.us_fk_id,
      role_fk_id: roleId,
    }));

    const body = { mapping };
    mutate(body);
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