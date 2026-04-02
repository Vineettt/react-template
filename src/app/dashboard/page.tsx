"use client";

import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui";

export default function Dashboard() {
  const { logout, isCheckingPermissions } = useAuthProtection();

  if (isCheckingPermissions) {
    return <GlobalLoading message="Checking permissions..." />;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      <button 
        onClick={logout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}