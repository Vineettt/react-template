import { permissionsConfig } from "@/constants/permission";

export function checkSidebarPermissions(
  permissionArray: string[] | undefined,
  userPermissions: any[]
): boolean {
  let hasAllPermissions = false;
  const permission = userPermissions || [];

  if (!permissionArray || permissionArray.length === 0) {
    return hasAllPermissions;
  }
  for (const expectedPermission of permissionArray) {
    const permissionConfig = permissionsConfig[expectedPermission];
    const find = permission.find((p: any) => 
      p?.endpoint === permissionConfig?.endpoint && p?.method === permissionConfig?.method
    );
    if (find) {
      hasAllPermissions = true;
      break;
    }
  }

  return hasAllPermissions;
}
