import { permissionsConfig } from "@/constants/permission";

export function checkSidebarPermissions(
  permissionArray: string[] | undefined,
  userPermissions: any[]
): boolean {
  const permission = userPermissions || [];
  
  if (!permissionArray || permissionArray.length === 0) {
    return false;
  }

  for (const expectedPermission of permissionArray) {
    const permissionConfig = permissionsConfig[expectedPermission];
    let find = permission.find((p: any) => 
      p?.endpoint === permissionConfig?.endpoint && p?.method === permissionConfig?.method
    );
    if (!find) {
      return false;
    }
  }
  
  return true;
}
