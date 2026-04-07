"use client";

import { useState, useRef } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Endpoint } from "@/constants/route";
import { Pencil, Trash2 } from "lucide-react";
import { RoleDialog } from "@/components/dialogs/role/add-update";
import { apiFetch } from "@/utils/apiUtils";
import { toast } from "sonner";

interface Role {
  id: string;
  role: string;
}

export default function Roles() {
  const { isCheckingPermissions } = useAuthProtection();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const pendingDeleteRef = useRef<Role | null>(null);

  if (isCheckingPermissions) {
    return <GlobalLoading message="Checking permissions..." />;
  }

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditClick = (role: Role) => {
    setSelectedRole(role);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    handleDelete(role);
  };

  const handleDelete = async (role: Role, ignoreKey?: boolean) => {
    try {
      const body: any = { roles: [{ role_id: role.id }] };
      if (ignoreKey) {
        body.IGNORE_KEY = "DELETE_ROLE";
      }

      const response = await apiFetch(Endpoint.ROLE, {
        method: "DELETE",
        body: JSON.stringify(body),
      });

      if (response?.warnings) {
        pendingDeleteRef.current = role;
        toast.warning(response.warnings.message || "Warning: Proceed with caution", {
          duration: 10000,
          action: {
            label: "Yes",
            onClick: () => {
              if (pendingDeleteRef.current) {
                executeDelete(pendingDeleteRef.current, true);
                pendingDeleteRef.current = null;
              }
            },
          },
          cancel: {
            label: "No",
            onClick: () => {
              pendingDeleteRef.current = null;
            },
          },
        });
        return;
      }

      if (response.message) {
        toast.success(response.message || "Role deleted successfully");
        setRefreshTrigger((prev) => prev + 1);
      } else {
        const message = response.message || "Failed to delete role";
        toast.error(message);
      }
    } catch (error) {
      toast.error("An error occurred while deleting role");
    }
  };

  const executeDelete = async (role: Role, ignoreKey: boolean) => {
    try {
      const body: any = { roles: [{ role_id: role.id }] };
      if (ignoreKey) {
        body.IGNORE_KEY = "DELETE_ROLE";
      }

      const response = await apiFetch(Endpoint.ROLE, {
        method: "DELETE",
        body: JSON.stringify(body),
      });

      if (response.message) {
        toast.success(response.message || "Role deleted successfully");
        setRefreshTrigger((prev) => prev + 1);
      } else {
        const message = response.message || "Failed to delete role";
        toast.error(message);
      }
    } catch (error) {
      toast.error("An error occurred while deleting role");
    }
  };

  const columns: Column<Role>[] = [
    { key: "role", header: "Role", accessor: (r: Role) => r.role },
  ];

  const actions: Action<Role>[] = [
    {
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleEditClick,
      variant: "ghost",
      size: "icon",
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteClick,
      variant: "ghost",
      size: "icon",
    },
  ];

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-4 flex flex-col gap-2.5">
      <DataTable<Role>
        title="Roles"
        endpoint={Endpoint.ROLES}
        columns={columns}
        keyExtractor={(r) => r.id}
        showAddButton={true}
        onAddClick={handleAddClick}
        actions={actions}
        emptyMessage="No roles found"
        refreshTrigger={refreshTrigger}
      />
      <RoleDialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={handleSuccess}
      />
      <RoleDialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setSelectedRole(null);
        }}
        role={selectedRole}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
