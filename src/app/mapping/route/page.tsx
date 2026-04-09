"use client";

import { useRef, useCallback, useMemo } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Endpoint } from "@/constants/route";
import { Pencil } from "lucide-react";
import { UpdateRouteDialog } from "@/components/dialogs/route/update";
import { useDialog } from "@/hooks/useDialog";

interface Route {
  id: string;
  endpoint: string;
  handler: string;
  method: string;
}

export default function Routes() {
  const { isCheckingPermissions } = useAuthProtection();
  const tableRef = useRef<{ refetch: () => void }>(null);

  const editDialog = useDialog<Route>({
    onSuccess: () => tableRef.current?.refetch(),
  });

  if (isCheckingPermissions) {
    return <GlobalLoading message="Checking permissions..." />;
  }

  const handleEditClick = useCallback((route: Route) => {
    editDialog.open(route);
  }, [editDialog]);

  const columns: Column<Route>[] = useMemo(() => [
    { key: "endpoint", header: "Endpoint", accessor: (r: Route) => r.endpoint },
    { key: "handler", header: "Handler", accessor: (r: Route) => r.handler },
    { key: "method", header: "Method", accessor: (r: Route) => r.method },
  ], []);

  const actions: Action<Route>[] = useMemo(() => [
    {
      icon: <Pencil className="h-4 w-4" />,
      onClick: handleEditClick,
      variant: "ghost",
      size: "icon",
    },
  ], [handleEditClick]);

  return (
    <div className="p-4 flex flex-col gap-2.5">
      <DataTable<Route>
        title="Routes"
        endpoint={Endpoint.ROUTES}
        columns={columns}
        keyExtractor={(r: Route) => r.id}
        actions={actions}
        emptyMessage="No routes found"
        ref={tableRef}
      />
      <UpdateRouteDialog
        open={editDialog.isOpen}
        onOpenChange={(open) => !open && editDialog.close()}
        route={editDialog.selectedItem}
        onSuccess={editDialog.onSuccess}
      />
    </div>
  );
}
