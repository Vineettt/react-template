"use client";

import { useState } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Endpoint } from "@/constants/route";
import { Pencil, Trash2 } from "lucide-react";

interface Role {
  id: string;
  role: string;
}

export default function Roles() {
  const { isCheckingPermissions } = useAuthProtection();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

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
    // TODO: Delete role API call
    console.log("Delete role:", role);
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
      />
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="w-[600px]">
            <CardHeader>
              <CardTitle>Add Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {}}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {isEditModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="w-[600px]">
            <CardHeader>
              <CardTitle>Edit Role</CardTitle>
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
