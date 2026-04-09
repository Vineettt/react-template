"use client";

import { useRef, useCallback, useMemo } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Endpoint } from "@/constants/route";
import { Pencil } from "lucide-react";
import { UserRoleDialog } from "@/components/dialogs/user/role/user";
import { useDialog } from "@/hooks/useDialog";

interface UserRole {
  us_fk_id: string;
  email: string;
  roles: string;
}

export default function UserRole() {
  const { isCheckingPermissions } = useAuthProtection();
  const tableRef = useRef<{ refetch: () => void }>(null);

  const editDialog = useDialog<UserRole>({
    onSuccess: () => tableRef.current?.refetch(),
  });

  if (isCheckingPermissions) {
    return <GlobalLoading message="Checking permissions..." />;
  }

  const handleEditClick = useCallback((userRole: UserRole) => {
    editDialog.open(userRole);
  }, [editDialog]);

  const columns: Column<UserRole>[] = useMemo(() => [
    { key: "email", header: "Email", accessor: (ur: UserRole) => ur.email },
    { key: "roles", header: "Roles", accessor: (ur: UserRole) => ur.roles },
  ], []);

  const actions: Action<UserRole>[] = useMemo(() => [
    {
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleEditClick,
      variant: "ghost",
      size: "icon",
    },
  ], [handleEditClick]);

  return (
    <div className="p-4 flex flex-col gap-2.5">
      <DataTable<UserRole>
        title="User Role"
        endpoint={Endpoint.USER_ROLE_MAPPING}
        columns={columns}
        keyExtractor={(ur) => ur.us_fk_id}
        actions={actions}
        emptyMessage="No user roles found"
        ref={tableRef}
      />
      <UserRoleDialog
        open={editDialog.isOpen}
        onOpenChange={(open) => !open && editDialog.close()}
        userRole={editDialog.selectedItem}
        onSuccess={() => {
          editDialog.onSuccess();
          editDialog.close();
        }}
      />
    </div>
  );
}