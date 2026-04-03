"use client";

import { useState } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Endpoint } from "@/constants/route";
import { Pencil } from "lucide-react";

interface UserRole {
  id: string;
  email: string;
  roles: string;
}

export default function UserRole() {
  const { isCheckingPermissions } = useAuthProtection();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null);

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
        keyExtractor={(ur) => ur.id}
        actions={actions}
        emptyMessage="No user roles found"
      />
      {isEditModalOpen && selectedUserRole && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="w-[600px]">
            <CardHeader>
              <CardTitle>Update User Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {}}>Update</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}