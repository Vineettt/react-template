import { useStorage } from "./useStorage";
import { STORAGE_KEYS } from "../constants/storage";
import { useCallback } from "react";

interface UserPermission {
  endpoint: string;
  method: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles?: string[];
  permissions?: UserPermission[];
}

export const useAppLoad = () => {
    const { getItem, setItem, removeItem } = useStorage();

    const storeUserData = useCallback((user: User, token?: string) => {
        setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(user.permissions || []));
        
        if(token){
          setItem(STORAGE_KEYS.TOKEN, token);
        }
        return { user: user, roles: user.roles, id: user.id };
    }, [setItem]);

    const loadUser = useCallback(() => {
        const users = getItem(STORAGE_KEYS.USER);
        if (users == undefined) {
          return null;
        }
        let permissions = getItem(STORAGE_KEYS.PERMISSIONS);
        const roles = users.roles;
        const id = users.id;
        return { user: users, roles: roles, id: id, permissions };
    }, [getItem]);

    const loadToken = useCallback(() => {
        const token = getItem(STORAGE_KEYS.TOKEN);
        if (token == null) {
          return null;
        }
        return { token: token };
    }, [getItem]);

    const loggedIn = useCallback(() => {
        const token = getItem(STORAGE_KEYS.TOKEN);
        if (!token) return false;

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.exp * 1000 > Date.now();
        } catch {
          return false;
        }
    }, [getItem]);

    const logout = useCallback(() => {
        removeItem(STORAGE_KEYS.TOKEN);
        removeItem(STORAGE_KEYS.USER);
        removeItem(STORAGE_KEYS.PERMISSIONS);
    }, [removeItem]);

    return {
        storeUserData,
        loadUser,
        loadToken,
        loggedIn,
        logout,
    };
}