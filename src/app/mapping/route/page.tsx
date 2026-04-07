"use client";

import { useState } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Endpoint } from "@/constants/route";
import { Pencil } from "lucide-react";
import { UpdateRouteDialog } from "@/components/dialogs/route/update";

interface Route {
  id: string;
  endpoint: string;
  handler: string;
  method: string;
}

export default function Routes() {
  const { isCheckingPermissions } = useAuthProtection();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (isCheckingPermissions) {
    return <GlobalLoading message="Checking permissions..." />;
  }

  const handleEditClick = (route: Route) => {
    setSelectedRoute(route);
    setIsEditModalOpen(true);
  };

  const columns: Column<Route>[] = [
    { key: "endpoint", header: "Endpoint", accessor: (r: Route) => r.endpoint },
    { key: "handler", header: "Handler", accessor: (r: Route) => r.handler },
    { key: "method", header: "Method", accessor: (r: Route) => r.method },
  ];

  const actions: Action<Route>[] = [
    {
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleEditClick,
      variant: "ghost",
      size: "icon",
    },
  ];

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-4 flex flex-col gap-2.5">
      <DataTable<Route>
        title="Routes"
        endpoint={Endpoint.ROUTES}
        columns={columns}
        keyExtractor={(r) => r.id}
        actions={actions}
        emptyMessage="No routes found"
        refreshTrigger={refreshTrigger}
      />
      <UpdateRouteDialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setSelectedRoute(null);
        }}
        route={selectedRoute}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
