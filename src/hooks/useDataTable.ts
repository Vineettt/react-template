"use client";

import { useState, useEffect, useCallback } from "react";
import { Endpoint } from "@/constants/route";
import { apiFetch, getErrorMessage } from "@/utils/apiUtils";

interface UseDataTableOptions {
  endpoint: Endpoint;
  initialPageSize?: number;
  roleFilter?: string;
  searchQuery?: string;
}

interface UseDataTableResult<T> {
  data: T[];
  total: number;
  isLoading: boolean;
  error: string | null;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => void;
}

export function useDataTable<T>({
  endpoint,
  initialPageSize = 10,
  roleFilter,
  searchQuery = "",
}: UseDataTableOptions): UseDataTableResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      interface DataTableRequest {
        limit: number;
        offset: number;
        search: string;
        role?: string;
      }
      const body: DataTableRequest = {
        limit: pageSize,
        offset: pageIndex * pageSize,
        search: searchQuery,
      };
      if (roleFilter) {
        body.role = roleFilter;
      }
      interface DataTableResponse {
        payload: T[];
        length: number;
      }
      const response = await apiFetch<DataTableResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
        signal,
      });
      setData(response?.payload || []);
      setTotal(response?.length || 0);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      setError(getErrorMessage(error) || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, pageIndex, pageSize, searchQuery, roleFilter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    total,
    isLoading,
    error,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    refetch,
  };
}
