"use client";

import { ReactNode, useState, useEffect } from "react";
import { Endpoint } from "@/constants/route";
import { useDataTable } from "@/hooks/useDataTable";
import { DataTableHeader } from "./data-table-header";
import { DataTableBody } from "./data-table-body";
import { DataTablePagination } from "./data-table-pagination";
import { Column, Action } from "./types";

interface DataTableProps<T> {
  title: string;
  columns: Column<T>[];
  endpoint: Endpoint;
  keyExtractor: (row: T) => string;
  actions?: Action<T>[];
  showAddButton?: boolean;
  onAddClick?: () => void;
  headerChildren?: ReactNode;
  searchEnabled?: boolean;
  initialPageSize?: number;
  emptyMessage?: string;
  roleFilter?: string;
  refreshTrigger?: number;
}

export function DataTable<T>({
  title,
  columns,
  endpoint,
  keyExtractor,
  actions = [],
  showAddButton = false,
  onAddClick,
  headerChildren,
  searchEnabled = true,
  initialPageSize = 10,
  emptyMessage = "No data found",
  roleFilter,
  refreshTrigger,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, total, isLoading, pageIndex, pageSize, setPageIndex, setPageSize, refetch } =
    useDataTable<T>({
      endpoint,
      initialPageSize,
      roleFilter,
      searchQuery,
    });

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="p-4 flex flex-col gap-2.5">
      <DataTableHeader
        title={title}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showAddButton={showAddButton}
        onAddClick={onAddClick}
        headerChildren={headerChildren}
        searchEnabled={searchEnabled}
        onResetPage={() => setPageIndex(0)}
      />

      <DataTableBody
        data={data}
        columns={columns}
        actions={actions}
        keyExtractor={keyExtractor}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
      />

      <DataTablePagination
        pageSize={pageSize}
        pageIndex={pageIndex}
        totalPages={totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
