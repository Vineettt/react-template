"use client";

import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui";

export default function Dashboard() {
  const { isCheckingPermissions } = useAuthProtection();

  if (isCheckingPermissions) {
    return <GlobalLoading message="Checking permissions..." />;
  }

  return (
    <>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
    </>
  );
}