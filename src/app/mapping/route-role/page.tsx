"use client";

import { useState, useEffect } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Endpoint } from "@/constants/route";
import { apiFetch } from "@/utils/apiUtils";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Role {
  id: string;
  role: string;
}

interface RoleRouteMapping {
  id: string;
  role: string;
  endpoint: string;
  method: string;
  handler: string;
}

export default function RoleRouteMapping() {
  const { isCheckingPermissions } = useAuthProtection();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiFetch(Endpoint.ROLE, { method: "GET" });
        const rolesData = response?.payload || [];
        setRoles(rolesData);
        if (rolesData.length > 0) {
          setSelectedRole(rolesData[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        toast.error("Failed to fetch roles");
      }
    };
    fetchRoles();
  }, []);

  if (isCheckingPermissions) {
    return <GlobalLoading message="Checking permissions..." />;
  }

  const handleAddClick = () => {
    console.log("Add role route mapping clicked");
  };

  const handleDeleteClick = async (mapping: RoleRouteMapping) => {
    try {
      const response = await apiFetch(`${Endpoint.ROLE_ROUTE_MAPPING}/${mapping.id}`, {
        method: "DELETE"
      });

      if (response.statusCode === 200 || response.success) {
        toast.success(response.message || "Mapping deleted successfully");
      } else {
        const message = response.message || "Failed to delete mapping";
        toast.error(message);
      }
    } catch (error) {
      toast.error("Failed to delete mapping");
    }
  };

  const columns: Column<RoleRouteMapping>[] = [
    { key: "role", header: "Role", accessor: (m: RoleRouteMapping) => m.role },
    { key: "endpoint", header: "Endpoint", accessor: (m: RoleRouteMapping) => m.endpoint },
    { key: "handler", header: "Handler", accessor: (m: RoleRouteMapping) => m.handler },
    { key: "method", header: "Method", accessor: (m: RoleRouteMapping) => m.method },
  ];

  const actions: Action<RoleRouteMapping>[] = [
    {
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteClick,
      variant: "ghost",
      size: "icon",
    },
  ];

  const roleSelect = (
    <select
      value={selectedRole}
      onChange={(e) => setSelectedRole(e.target.value)}
      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.role}
        </option>
      ))}
    </select>
  );

  return (
    <div className="p-4 flex flex-col gap-2.5">
      <DataTable<RoleRouteMapping>
        title="Role Route Mapping"
        endpoint={Endpoint.ROLE_ROUTE_MAPPINGS}
        columns={columns}
        showAddButton={true}
        onAddClick={handleAddClick}
        keyExtractor={(m) => m.id}
        headerChildren={roleSelect}
        actions={actions}
        roleFilter={selectedRole}
        emptyMessage="No mappings found"
      />
    </div>
  );
}
