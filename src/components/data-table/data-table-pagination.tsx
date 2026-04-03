"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTablePaginationProps {
  pageSize: number;
  pageIndex: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function DataTablePagination({
  pageSize,
  pageIndex,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <select
        value={pageSize}
        onChange={(e) => {
          onPageSizeChange(Number(e.target.value));
          onPageChange(0);
        }}
        className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm"
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={100}>100</option>
      </select>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
        disabled={pageIndex === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        Page {pageIndex + 1} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages - 1, pageIndex + 1))}
        disabled={pageIndex >= totalPages - 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
