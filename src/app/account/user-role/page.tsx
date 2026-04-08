"use client";

import { useState, useRef } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Endpoint } from "@/constants/route";
import { Pencil } from "lucide-react";
import { UserRoleDialog } from "@/components/dialogs/user/role/user";

interface UserRole {
  us_fk_id: string;
  email: string;
  roles: string;
}

export default function UserRole() {
  const { isCheckingPermissions } = useAuthProtection();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null);
  const tableRef = useRef<{ refetch: () => void }>(null);

  if (isCheckingPermissions) {
    return <GlobalLoading message="Checking permissions..." />;
  }

  const handleEditClick = (userRole: UserRole) => {
    setSelectedUserRole(userRole);
    setIsEditModalOpen(true);
  };

  const columns: Column<UserRole>[] = [
    { key: "email", header: "Email", accessor: (ur: UserRole) => ur.email },
    { key: "roles", header: "Roles", accessor: (ur: UserRole) => ur.roles },
  ];

  const actions: Action<UserRole>[] = [
    {
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleEditClick,
      variant: "ghost",
      size: "icon",
    },
  ];

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
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        userRole={selectedUserRole}
        onSuccess={() => {
          tableRef.current?.refetch();
          setIsEditModalOpen(false);
          setSelectedUserRole(null);
        }}
      />
    </div>
  );
}