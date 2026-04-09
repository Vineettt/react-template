import { create } from 'zustand';
import { useStorage } from '@/hooks/useStorage';
import { STORAGE_KEYS } from '@/constants/storage';

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

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: UserPermission[];
  loading: boolean;
  isAuthenticated: boolean;
  storeUserData: (user: User, token?: string) => void;
  loadUser: () => User | null;
  loadToken: () => string | null;
  loggedIn: () => boolean;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const { getItem, setItem, removeItem } = useStorage();

  return {
    user: null,
    token: null,
    permissions: [],
    loading: true,
    isAuthenticated: false,

    storeUserData: (user: User, token?: string) => {
      setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(user.permissions || []));
      if (token) {
        setItem(STORAGE_KEYS.TOKEN, token);
      }
      set({
        user,
        token: token || get().token,
        permissions: user.permissions || [],
        isAuthenticated: true,
      });
    },

    loadUser: () => {
      const userStr = getItem(STORAGE_KEYS.USER);
      if (!userStr) return null;
      
      const user = typeof userStr === 'string' ? JSON.parse(userStr) : userStr;
      
      const permissionsStr = getItem(STORAGE_KEYS.PERMISSIONS);
      const permissions = permissionsStr 
        ? (typeof permissionsStr === 'string' ? JSON.parse(permissionsStr) : permissionsStr) 
        : [];
      
      set({
        user,
        permissions,
        isAuthenticated: !!getItem(STORAGE_KEYS.TOKEN),
      });
      return user;
    },

    loadToken: () => {
      const token = getItem(STORAGE_KEYS.TOKEN);
      if (!token) return null;
      set({ token, isAuthenticated: true });
      return token;
    },

    loggedIn: () => {
      const token = getItem(STORAGE_KEYS.TOKEN);
      if (!token) return false;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
      } catch {
        return false;
      }
    },

    logout: () => {
      removeItem(STORAGE_KEYS.TOKEN);
      removeItem(STORAGE_KEYS.USER);
      removeItem(STORAGE_KEYS.PERMISSIONS);
      set({
        user: null,
        token: null,
        permissions: [],
        isAuthenticated: false,
      });
    },

    setLoading: (loading: boolean) => {
      set({ loading });
    },

    initializeAuth: async () => {
      const { loadUser, loggedIn, setLoading } = get();
      setLoading(true);
      
      if (loggedIn()) {
        loadUser();
      }
      
      setLoading(false);
    },
  };
});
