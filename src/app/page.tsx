"use client";

import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { GlobalLoading } from "@/components/ui";

export default function Home() {
  const { isCheckingPermissions } = useAuthProtection();

  return <GlobalLoading message="Checking permissions..." />;
}
