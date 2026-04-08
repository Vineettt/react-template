"use client";

import { useState, useRef } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Endpoint } from "@/constants/route";
import { Pencil, Trash2 } from "lucide-react";
import { RoleDialog } from "@/components/dialogs/role/add-update";
import { useMutationWithConfirm } from "@/hooks/useMutationWithConfirm";

interface Role {
  id: string;
  role: string;
}

export default function Roles() {
  const { isCheckingPermissions } = useAuthProtection();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const tableRef = useRef<{ refetch: () => void }>(null);

  const { mutate: handleDelete } = useMutationWithConfirm<string, any>({
    endpoint: Endpoint.ROLE,
    method: "DELETE",
    onSuccess: () => tableRef.current?.refetch(),
    successMessage: "Role deleted successfully",
    deleteKey: "role_id",
    deleteWrapper: "roles",
  });

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
      onClick: (role) => handleDelete(role.id),
      variant: "ghost",
      size: "icon",
    },
  ];

  const handleSuccess = () => {
    tableRef.current?.refetch();
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
        ref={tableRef}
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
