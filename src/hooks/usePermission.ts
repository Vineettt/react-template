import { useAppLoad } from "./useAppload";
import { checkUserPermissions } from "@/utils/permissionUtils";

export const usePermission = (path: string) => {
    const { loadUser } = useAppLoad();
    const user = loadUser();
    return checkUserPermissions(path, user?.permissions || []);
}