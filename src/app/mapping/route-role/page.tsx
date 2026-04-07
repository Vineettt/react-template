"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Endpoint } from "@/constants/route";
import { apiFetch } from "@/utils/apiUtils";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RoleRouteMappingDialog } from "@/components/dialogs/role-route-mapping/modify";

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const pendingDeleteRef = useRef<string | null>(null);

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
    const role = roles.find((r) => r.id === selectedRole);
    setSelectedRoleForMapping(role || null);
    setIsAddModalOpen(true);
  };

  const executeDelete = async (mappingId: string, ignoreKey?: boolean) => {
    const body: any = {
      mapping: [{ mapping_id: mappingId }],
    };
    if (ignoreKey) {
      body.IGNORE_KEY = "DELETE_ROLE_ROUTE_MAPPING";
    }

    const response = await apiFetch(Endpoint.ROLE_ROUTE_MAPPING, {
      method: "DELETE",
      body: JSON.stringify(body),
    });

    if (response.statusCode === 200 || response.message) {
      toast.success(response.message || "Mapping deleted successfully");
      setRefreshTrigger((prev) => prev + 1);
    } else if (response.warnings) {
      return response;
    } else {
      const message = response.message || "Failed to delete mapping";
      toast.error(message);
    }
    return response;
  };

  const handleDeleteClick = async (mapping: RoleRouteMapping) => {
    try {
      const response = await executeDelete(mapping.id);

      if (response?.warnings) {
        pendingDeleteRef.current = mapping.id;
        toast.warning(response.warnings.message || "Warning: Proceed with caution", {
          duration: 10000,
          action: {
            label: "Yes",
            onClick: () => {
              if (pendingDeleteRef.current) {
                executeDelete(pendingDeleteRef.current, true);
                pendingDeleteRef.current = null;
              }
            },
          },
          cancel: {
            label: "No",
            onClick: () => {
              pendingDeleteRef.current = null;
            },
          },
        });
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

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsAddModalOpen(false);
    setSelectedRoleForMapping(null);
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
        refreshTrigger={refreshTrigger}
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
    </div>
  );
}
