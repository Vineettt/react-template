"use client";

import { useRef, useCallback, useMemo } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Endpoint } from "@/constants/route";
import { Pencil, Trash2 } from "lucide-react";
import { RoleDialog } from "@/components/dialogs/role/add-update";
import { useMutationWithConfirm } from "@/hooks/useMutationWithConfirm";
import { useDialog } from "@/hooks/useDialog";

interface Role {
  id: string;
  role: string;
}

export default function Roles() {
  const { isCheckingPermissions } = useAuthProtection();
  const tableRef = useRef<{ refetch: () => void }>(null);

  const addDialog = useDialog({
    onSuccess: () => tableRef.current?.refetch(),
  });

  const editDialog = useDialog<Role>({
    onSuccess: () => tableRef.current?.refetch(),
  });

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

  const handleAddClick = useCallback(() => {
    addDialog.open();
  }, [addDialog]);

  const handleEditClick = useCallback((role: Role) => {
    editDialog.open(role);
  }, [editDialog]);

  const columns: Column<Role>[] = useMemo(() => [
    { key: "role", header: "Role", accessor: (r: Role) => r.role },
  ], []);

  const actions: Action<Role>[] = useMemo(() => [
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
  ], [handleEditClick, handleDelete]);


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
        open={addDialog.isOpen}
        onOpenChange={(open) => !open && addDialog.close()}
        onSuccess={addDialog.onSuccess}
      />
      <RoleDialog
        open={editDialog.isOpen}
        onOpenChange={(open) => !open && editDialog.close()}
        role={editDialog.selectedItem}
        onSuccess={editDialog.onSuccess}
      />
    </div>
  );
}
