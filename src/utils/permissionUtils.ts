import { locationConfig, permissionsConfig } from "@/constants/permission";

export function checkUserPermissions(path: string, userPermissions: any[]): boolean {
    const permission = userPermissions || [];
    const config = locationConfig[path];
    
    if(config?.permissionRequired){
        const expectedPermissions = config.permissionArray || [];
        if(expectedPermissions.length === 0){
            return false;
        }

        for(const expectedPermission of expectedPermissions){
            const permissionConfig = permissionsConfig[expectedPermission];
            let find = permission.find((p: any) => p?.endpoint === permissionConfig?.endpoint && p?.method === permissionConfig?.method);
            if(!find){
                return false;
            }
        }
    }
    return true;
}
