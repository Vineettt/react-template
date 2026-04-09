"use client";

import { useRef, useMemo, useCallback } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Endpoint } from "@/constants/route";
import { Pencil } from "lucide-react";
import { AddUserDialog } from "@/components/dialogs/user/add";
import { UpdateUserDialog } from "@/components/dialogs/user/update";
import { useDialog } from "@/hooks/useDialog";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_status: string;
}

export default function Users() {
  const { isCheckingPermissions } = useAuthProtection();
  const tableRef = useRef<{ refetch: () => void }>(null);

  const addDialog = useDialog({
    onSuccess: () => tableRef.current?.refetch(),
  });

  const editDialog = useDialog<User>({
    onSuccess: () => tableRef.current?.refetch(),
  });

  if (isCheckingPermissions) {
    return <GlobalLoading message="Checking permissions..." />;
  }

  const handleAddClick = useCallback(() => {
    addDialog.open();
  }, [addDialog]);

  const handleEditClick = useCallback((user: User) => {
    editDialog.open(user);
  }, [editDialog]);

  const columns: Column<User>[] = useMemo(() => [
    { key: "email", header: "Email", accessor: (u) => u.email },
    { key: "first_name", header: "First Name", accessor: (u) => u.first_name },
    { key: "last_name", header: "Last Name", accessor: (u) => u.last_name },
    { key: "user_status", header: "Status", accessor: (u) => u.user_status },
  ], []);

  const actions: Action<User>[] = useMemo(() => [
    {
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleEditClick,
      variant: "ghost",
      size: "icon",
    },
  ], [handleEditClick]);

  return (
    <div className="p-4 flex flex-col gap-2.5">
      <DataTable
        title="Users"
        endpoint={Endpoint.USERS}
        columns={columns}
        keyExtractor={(u) => u.id}
        showAddButton={true}
        onAddClick={handleAddClick}
        actions={actions}
        emptyMessage="No users found"
        ref={tableRef}
      />
      {addDialog.isOpen && (
        <AddUserDialog
          open={addDialog.isOpen}
          onOpenChange={(open) => !open && addDialog.close()}
          onSuccess={addDialog.onSuccess}
        />
      )}
      {editDialog.isOpen && editDialog.selectedItem && (
        <UpdateUserDialog
          open={editDialog.isOpen}
          onOpenChange={(open) => !open && editDialog.close()}
          onSuccess={editDialog.onSuccess}
          user={editDialog.selectedItem}
        />
      )}
    </div>
  );
}