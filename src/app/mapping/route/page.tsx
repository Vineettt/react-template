"use client";

import { useState } from "react";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui/global-loading";
import { DataTable, Column, Action } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Endpoint } from "@/constants/route";
import { Pencil } from "lucide-react";

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

  return (
    <div className="p-4 flex flex-col gap-2.5">
      <DataTable<Route>
        title="Routes"
        endpoint={Endpoint.ROUTES}
        columns={columns}
        keyExtractor={(r) => r.id}
        actions={actions}
        emptyMessage="No routes found"
      />
      {isEditModalOpen && selectedRoute && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="w-[600px]">
            <CardHeader>
              <CardTitle>Edit Route</CardTitle>
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
