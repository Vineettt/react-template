"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { mapApiErrorsToForm } from "@/utils/formErrorUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/utils/apiUtils";
import { Endpoint } from "@/constants/route";
import { toast } from "sonner";
import { useMutationWithConfirm } from "@/hooks/useMutationWithConfirm";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_status: string;
}

interface UserStatus {
  value: string;
  viewValue: string;
}

interface UpdateUserFormData {
  first_name: string;
  last_name: string;
  email: string;
  status: string;
}

interface UpdateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  user: User | null;
}

export function UpdateUserDialog({ open, onOpenChange, onSuccess, user }: UpdateUserDialogProps) {
  const [statuses, setStatuses] = useState<UserStatus[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);

  const { mutate } = useMutationWithConfirm<any, any>({
    endpoint: Endpoint.USER,
    method: "PUT",
    onSuccess: (response) => {
      if (response.message && !response.errors) {
        toast.success(response.message);
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else if (response.errors?.no) {
        toast.info(response.errors.no);
        onOpenChange(false);
      } else {
        const hasFieldErrors = mapApiErrorsToForm(response, setError, [], toast.error);
        if (!hasFieldErrors) {
          const message = response.message || "Failed to update user";
          toast.error(message);
          setError("root", { message });
        }
      }
    },
    onError: () => {
      toast.error("An error occurred while updating user");
    }
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<UpdateUserFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      status: "",
    },
  });

  useEffect(() => {
    if (open) {
      setIsLoadingStatuses(true);
      apiFetch(Endpoint.USER_STATUS)
        .then((response) => {
          if (response.payload) {
            const data = response?.payload || [];
            setStatuses(data);
            if (user && data.length > 0) {
              const matchingStatus = data.find(
                (s: UserStatus) => s.value?.toLowerCase()?.includes(user.user_status?.toLowerCase())
              );
              const statusValue = matchingStatus?.value || user.user_status;
              reset({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                status: statusValue,
              });
            }
          }
        })
        .catch(() => toast.error("Failed to load status options"))
        .finally(() => setIsLoadingStatuses(false));
    }
  }, [open, user, reset]);

  const onSubmit = (data: UpdateUserFormData) => {
    if (!user) return;
    
    const body = {
      user: [{
        id: user.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        status: data.status,
      }],
    };

    mutate(body);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" type="text" {...register("first_name", { required: "First name is required" })} />
                {errors.first_name && <span className="text-sm text-red-500">{errors.first_name.message}</span>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" type="text" {...register("last_name", { required: "Last name is required" })} />
                {errors.last_name && <span className="text-sm text-red-500">{errors.last_name.message}</span>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" disabled {...register("email", { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" } })} />
              {errors.email && <span className="text-sm text-red-500">{errors.email.message}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: "Status is required" }}
                render={({ field }) => {
                  const selectedStatus = statuses.find(s => s.value === field.value);
                  return (
                    <Select value={field.value || ""} onValueChange={field.onChange} disabled={isLoadingStatuses}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder={isLoadingStatuses ? "Loading..." : "Select status"}>
                          {selectedStatus?.viewValue || field.value || "Select status"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.length === 0 ? (
                          <SelectItem value="_empty" disabled>No statuses available</SelectItem>
                        ) : (
                          statuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.viewValue}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.status && <span className="text-sm text-red-500">{errors.status.message}</span>}
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update User"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}