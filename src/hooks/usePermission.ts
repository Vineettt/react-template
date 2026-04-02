import { useAppLoad } from "./useAppload";
import { checkUserPermissions } from "@/utils/permissionUtils";

export const usePermission = (path: string) => {
    console.log('path', path)
    const { loadUser } = useAppLoad();
    const user = loadUser();
    return checkUserPermissions(path, user?.permissions || []);
}