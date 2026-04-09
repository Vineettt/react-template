import { permissionsConfig } from "@/constants/permission";

interface UserPermission {
  endpoint: string;
  method: string;
}

export function checkSidebarPermissions(
  permissionArray: string[] | undefined,
  userPermissions: UserPermission[]
): boolean {
  let hasAllPermissions = false;
  const permission = userPermissions || [];

  if (!permissionArray || permissionArray.length === 0) {
    return hasAllPermissions;
  }

  for (const expectedPermission of permissionArray) {
    const permissionConfig = permissionsConfig[expectedPermission];
    const find = permission.find((p: UserPermission) => permissionConfig.endpoint === p.endpoint && permissionConfig.method === p.method);
    if (find) {
      hasAllPermissions = true;
      break;
    }
  }

  return hasAllPermissions;
}
