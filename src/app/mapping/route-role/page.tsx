"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Endpoint } from "@/constants/route";
import { apiFetch } from "@/utils/apiUtils";
import { Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { RoleRouteMappingDialog } from "@/components/dialogs/role-route-mapping/modify";
import { UpdateRouteDialog } from "@/components/dialogs/route/update";
import { useMutationWithConfirm } from "@/hooks/useMutationWithConfirm";

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
  route_id: string;
}

export default function RoleRouteMapping() {
  const { isCheckingPermissions } = useAuthProtection();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRoleForMapping, setSelectedRoleForMapping] = useState<Role | null>(null);
  const [isRouteEditModalOpen, setIsRouteEditModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RoleRouteMapping | null>(null);
  const tableRef = useRef<{ refetch: () => void }>(null);

  const { mutate: handleDelete } = useMutationWithConfirm<string, any>({
    endpoint: Endpoint.ROLE_ROUTE_MAPPING,
    method: "DELETE",
    onSuccess: () => tableRef.current?.refetch(),
    successMessage: "Mapping deleted successfully",
    deleteKey: "mapping_id",
    deleteWrapper: "mapping",
  });

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
    const role = roles.find(r => r.id === selectedRole);
    setSelectedRoleForMapping(role || null);
    setIsAddModalOpen(true);
  };

  const handleEditClick = (mapping: RoleRouteMapping) => {
    const role = roles.find(r => r.id === selectedRole);
    setSelectedRoleForMapping(role || null);
    setIsAddModalOpen(true);
  };

  const handleRouteEditClick = (mapping: RoleRouteMapping) => {
    setSelectedRoute(mapping);
    setIsRouteEditModalOpen(true);
  };

  const columns: Column<RoleRouteMapping>[] = [
    { key: "role", header: "Role", accessor: (m: RoleRouteMapping) => m.role },
    { key: "endpoint", header: "Endpoint", accessor: (m: RoleRouteMapping) => m.endpoint },
    { key: "handler", header: "Handler", accessor: (m: RoleRouteMapping) => m.handler },
    { key: "method", header: "Method", accessor: (m: RoleRouteMapping) => m.method },
  ];

  const actions: Action<RoleRouteMapping>[] = [
    {
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleRouteEditClick,
      variant: "ghost",
      size: "icon",
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (mapping: RoleRouteMapping) => handleDelete(mapping.id),
      variant: "ghost",
      size: "icon",
    },
  ];

  const handleSuccess = () => {
    tableRef.current?.refetch();
    setIsAddModalOpen(false);
    setSelectedRoleForMapping(null);
  };

  const handleRouteSuccess = () => {
    tableRef.current?.refetch();
    setIsRouteEditModalOpen(false);
    setSelectedRoute(null);
  };

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
        ref={tableRef}
      />
      <RoleRouteMappingDialog
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setSelectedRoleForMapping(null);
        }}
        role={selectedRoleForMapping}
        onSuccess={handleSuccess}
      />
      <UpdateRouteDialog
        open={isRouteEditModalOpen}
        onOpenChange={(open) => {
          setIsRouteEditModalOpen(open);
          if (!open) setSelectedRoute(null);
        }}
        route={selectedRoute ? {
          id: selectedRoute.route_id,
          endpoint: selectedRoute.endpoint,
          handler: selectedRoute.handler,
          method: selectedRoute.method,
        } : null}
        roleId={selectedRole}
        onSuccess={handleRouteSuccess}
      />
    </div>
  );
}
