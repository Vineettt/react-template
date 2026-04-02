import { useStorage } from "./useStorage";
import { STORAGE_KEYS } from "../constants/storage";

export const useAppLoad = () => {
    const { getItem, setItem, removeItem } = useStorage();

    const storeUserData = (user: any, token?: string) => {
        setItem(STORAGE_KEYS.USER, user);
        setItem(STORAGE_KEYS.PERMISSIONS, user.permissions || []);
        
        if(token){
          setItem(STORAGE_KEYS.TOKEN, token);
        }
        return { user: user, roles: user.roles, id: user.id };
    }

    const loadUser = () => {
        const users = getItem(STORAGE_KEYS.USER);
        if (users == undefined) {
          return null;
        }
        let permissions = getItem(STORAGE_KEYS.PERMISSIONS);
        const roles = users.roles;
        const id = users.id;
        return { user: users, roles: roles, id: id, permissions };
    }

    const loadToken = () => {
        const token = getItem(STORAGE_KEYS.TOKEN);
        if (token == null) {
          return null;
        }
        return { token: token };
    }

    const loggedIn = () => {
        const token = getItem(STORAGE_KEYS.TOKEN);
        if (!token) return false;

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.exp * 1000 > Date.now();
        } catch {
          return false;
        }
    }

    const logout = () => {
        removeItem(STORAGE_KEYS.TOKEN);
        removeItem(STORAGE_KEYS.USER);
        removeItem(STORAGE_KEYS.PERMISSIONS);
    }

    return {
        storeUserData,
        loadUser,
        loadToken,
        loggedIn,
        logout,
    };
}