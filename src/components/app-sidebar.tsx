"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Settings, 
  Users, 
  FileText, 
  BarChart3, 
  HelpCircle, 
  LogOut,
  ChevronDown,
  LayoutDashboard,
  PieChart,
  Shield,
  FileCheck,
  UserCog,
  UserCircle,
  Link,
  GitBranch,
  Map,
  UserCheck,
  GitMerge,
  GitPullRequest,
  MapPin,
  Navigation,
  Crown,
  Award,
  Share2
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthProtection } from "@/contexts/AuthProtectionContext";
import { useAuthStore } from "@/stores/authStore";
import { checkSidebarPermissions } from "@/utils/sidebarPermissionUtils";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState, useMemo, useCallback } from "react";
import { logger } from "@/utils/logger";

interface SidebarItem {
  title: string;
  url: string;
  icon: string;
  action?: string;
  permissionRequired?: boolean;
  permissionArray?: string[];
  children?: SidebarItem[];
}

interface SidebarConfig {
  config: {
    collapsible: boolean;
    collapsibleType: "icon" | "offcanvas" | "none";
    showRail: boolean;
  };
  header: {
    title: string;
    subtitle: string;
    icon: string;
  };
  navigation: SidebarItem[];
  footer: SidebarItem[];
}

const iconMap = {
  Home,
  Settings,
  Users,
  FileText,
  BarChart3,
  HelpCircle,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  PieChart,
  Shield,
  FileCheck,
  UserCog,
  UserCircle,
  Link,
  GitBranch,
  Map,
  UserCheck,
  GitMerge,
  GitPullRequest,
  MapPin,
  Navigation,
  Crown,
  Award,
  Share2,
};

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuthProtection();
  const { user } = useAuthStore();
  const [sidebarConfig, setSidebarConfig] = useState<SidebarConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    import("@/config/sidebar.json").then((module) => {
      setSidebarConfig(module.default as SidebarConfig);
      setConfigError(null);
    }).catch((error) => {
      logger.error("Failed to load sidebar configuration:", error);
      setConfigError("Failed to load sidebar configuration");
    });
  }, []);

  const toggleExpanded = useCallback((itemTitle: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemTitle)) {
        newSet.delete(itemTitle);
      } else {
        newSet.add(itemTitle);
      }
      return newSet;
    });
  }, []);

  const checkMenuItemPermissions = useCallback((item: SidebarItem): boolean => {
    if (!item.permissionRequired) {
      return true;
    }

    if (!user?.permissions) {
      return false;
    }

    return checkSidebarPermissions(item.permissionArray, user.permissions);
  }, [user?.permissions]);

  const handleMenuClick = useCallback((item: SidebarItem) => {
    if (!checkMenuItemPermissions(item)) {
      return;
    }

    if (item.action === "logout") {
      logout();
    } else {
      router.push(item.url);
    }
  }, [checkMenuItemPermissions, logout, router]);

  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Home;
  };

  const isActive = (itemUrl: string): boolean => {
    if (!itemUrl || itemUrl === "") return false;
    return pathname === itemUrl || pathname.startsWith(itemUrl + "/");
  };

  const renderMenuItem = (item: SidebarItem, level: number = 0) => {
    const hasPermission = checkMenuItemPermissions(item);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.title);

    if (!hasPermission) {
      return null;
    }

    if (hasChildren) {
      const isChildActive = item.children?.some(child => isActive(child.url)) ?? false;
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            className={`hover:bg-sidebar-accent/50 transition-all duration-200 ${isChildActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
            onClick={() => toggleExpanded(item.title)}
          >
            {(() => {
              const IconComponent = getIcon(item.icon);
              return <IconComponent className={`${isChildActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/80'}`} />;
            })()}
            <span className={`font-medium ${isChildActive ? 'text-sidebar-accent-foreground' : ''}`}>{item.title}</span>
            <ChevronDown className={`ml-auto transition-transform duration-200 text-sidebar-foreground/60 ${isExpanded ? 'rotate-180' : ''}`} />
          </SidebarMenuButton>
          {isExpanded && (
            <SidebarMenuSub className="space-y-1">
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }

    const active = isActive(item.url);

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          onClick={() => handleMenuClick(item)}
          disabled={!hasPermission}
          className={`hover:bg-sidebar-accent/50 transition-all duration-200 ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''} ${!hasPermission ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {(() => {
            const IconComponent = getIcon(item.icon);
            return <IconComponent className={`${active ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/80'}`} />;
          })()}
          <span className={`font-medium ${active ? 'text-sidebar-accent-foreground' : ''}`}>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  if (!sidebarConfig) {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar 
      collapsible={sidebarConfig.config.collapsible ? sidebarConfig.config.collapsibleType : "none"}
      variant="inset"
    >
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="font-semibold hover:bg-sidebar-accent/80">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-sidebar-primary-foreground shadow-sm">
                {(() => {
                  const IconComponent = getIcon(sidebarConfig.header.icon);
                  return <IconComponent className="size-4" />;
                })()}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{sidebarConfig.header.title}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{sidebarConfig.header.subtitle}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-sidebar-foreground/70">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarConfig.navigation.map((item) => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        <SidebarMenu>
          {sidebarConfig.footer.map((item) => {
            const hasPermission = checkMenuItemPermissions(item);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  onClick={() => handleMenuClick(item)}
                  disabled={!hasPermission}
                  className={`${item.action === "logout" ? "text-destructive hover:bg-destructive/10 hover:text-destructive" : "hover:bg-sidebar-accent/50"} ${!hasPermission ? "opacity-50 cursor-not-allowed" : ""} transition-all duration-200`}
                >
                  {(() => {
                    const IconComponent = getIcon(item.icon);
                    return <IconComponent className={item.action === "logout" ? "text-destructive" : "text-sidebar-foreground/80"} />;
                  })()}
                  <span className="font-medium">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarFooter>
      {sidebarConfig.config.showRail && <SidebarRail />}
    </Sidebar>
  );
}
