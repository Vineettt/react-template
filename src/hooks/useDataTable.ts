"use client";

import { useState, useEffect, useCallback } from "react";
import { Endpoint } from "@/constants/route";
import { apiFetch } from "@/utils/apiUtils";

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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const body: any = {
        limit: pageSize,
        offset: pageIndex * pageSize,
        search: searchQuery,
      };
      if (roleFilter) {
        body.role = roleFilter;
      }
      const response = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setData(response?.payload || []);
      setTotal(response?.length || 0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, pageIndex, pageSize, searchQuery, roleFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    total,
    isLoading,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    refetch,
  };
}
