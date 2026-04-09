import { locationConfig, permissionsConfig } from "@/constants/permission";

interface UserPermission {
  endpoint: string;
  method: string;
}

export function checkUserPermissions(path: string, userPermissions: UserPermission[]): boolean {
    const permission = userPermissions || [];
    const config = locationConfig[path];

    if(config?.permissionRequired){
        const expectedPermissions = config.permissionArray || [];
        if(expectedPermissions.length === 0){
            return false;
        }

        let hasAllPermissions = false;

        for(const expectedPermission of expectedPermissions){
            const permissionConfig = permissionsConfig[expectedPermission];
            const find = permission.find((p: UserPermission) => permissionConfig.endpoint === p.endpoint && permissionConfig.method === p.method);
            if(find){
                hasAllPermissions = true;
                break;
            }
        }
        return hasAllPermissions;
    }
    return true;
}
