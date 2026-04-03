"use client";

import { useState } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Endpoint } from "@/constants/route";
import { Pencil } from "lucide-react";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_status: string;
}

export default function Users() {
  const { isCheckingPermissions } = useAuthProtection();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (isCheckingPermissions) {
    return <GlobalLoading message="Checking permissions..." />;
  }

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const columns: Column<User>[] = [
    { key: "email", header: "Email", accessor: (u) => u.email },
    { key: "first_name", header: "First Name", accessor: (u) => u.first_name },
    { key: "last_name", header: "Last Name", accessor: (u) => u.last_name },
    { key: "user_status", header: "Status", accessor: (u) => u.user_status },
  ];

  const actions: Action<User>[] = [
    {
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleEditClick,
      variant: "ghost",
      size: "icon",
    },
  ];

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
      />
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="w-[600px]">
            <CardHeader>
              <CardTitle>Add User</CardTitle>
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
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="w-[600px]">
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
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