"use client";

import { useState, useRef } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Endpoint } from "@/constants/route";
import { Pencil } from "lucide-react";
import { AddUserDialog } from "@/components/dialogs/user/add";
import { UpdateUserDialog } from "@/components/dialogs/user/update";

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
  const tableRef = useRef<{ refetch: () => void }>(null);

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
        ref={tableRef}
      />
      {isAddModalOpen && (
        <AddUserDialog 
          open={isAddModalOpen} 
          onOpenChange={setIsAddModalOpen} 
          onSuccess={() => tableRef.current?.refetch()}
        />
      )}
      {isEditModalOpen && selectedUser && (
        <UpdateUserDialog 
          open={isEditModalOpen} 
          onOpenChange={setIsEditModalOpen}
          onSuccess={() => tableRef.current?.refetch()}
          user={selectedUser}
        />
      )}
    </div>
  );
}