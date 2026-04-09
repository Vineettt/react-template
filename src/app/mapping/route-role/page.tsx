"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { useDialog } from "@/hooks/useDialog";

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
  const tableRef = useRef<{ refetch: () => void }>(null);

  const mappingDialog = useDialog<Role>({
    onSuccess: () => tableRef.current?.refetch(),
  });

  const routeEditDialog = useDialog<RoleRouteMapping>({
    onSuccess: () => tableRef.current?.refetch(),
  });

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

  const handleAddClick = useCallback(() => {
    const role = roles.find(r => r.id === selectedRole);
    mappingDialog.open(role || undefined);
  }, [roles, selectedRole, mappingDialog]);

  const handleEditClick = useCallback((mapping: RoleRouteMapping) => {
    const role = roles.find(r => r.id === selectedRole);
    mappingDialog.open(role || undefined);
  }, [roles, selectedRole, mappingDialog]);

  const handleRouteEditClick = useCallback((mapping: RoleRouteMapping) => {
    routeEditDialog.open(mapping);
  }, [routeEditDialog]);

  const columns: Column<RoleRouteMapping>[] = useMemo(() => [
    { key: "role", header: "Role", accessor: (m: RoleRouteMapping) => m.role },
    { key: "endpoint", header: "Endpoint", accessor: (m: RoleRouteMapping) => m.endpoint },
    { key: "handler", header: "Handler", accessor: (m: RoleRouteMapping) => m.handler },
    { key: "method", header: "Method", accessor: (m: RoleRouteMapping) => m.method },
  ], []);

  const actions: Action<RoleRouteMapping>[] = useMemo(() => [
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
  ], [handleRouteEditClick, handleDelete]);


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
        open={mappingDialog.isOpen}
        onOpenChange={(open) => !open && mappingDialog.close()}
        role={mappingDialog.selectedItem}
        onSuccess={mappingDialog.onSuccess}
      />
      <UpdateRouteDialog
        open={routeEditDialog.isOpen}
        onOpenChange={(open) => !open && routeEditDialog.close()}
        route={routeEditDialog.selectedItem ? {
          id: routeEditDialog.selectedItem.route_id,
          endpoint: routeEditDialog.selectedItem.endpoint,
          handler: routeEditDialog.selectedItem.handler,
          method: routeEditDialog.selectedItem.method,
        } : null}
        roleId={selectedRole}
        onSuccess={routeEditDialog.onSuccess}
      />
    </div>
  );
}
