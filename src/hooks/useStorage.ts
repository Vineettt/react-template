export const useStorage = () => {
    const storage = typeof window !== 'undefined' ? localStorage : null;
    const session = typeof window !== 'undefined' ? sessionStorage : null;

    const getItem = (key: string) => {
        if (!storage) return null;
        const item = storage.getItem(key);
        if (item && isJsonString(item)) {
            return JSON.parse(item);
        }
        return item;
    };

    const setItem = (key: string, value: string) => {
        if (!storage) return;
        return storage.setItem(key, JSON.stringify(value));
    };

    const removeItem = (key: string) => {
        if (!storage) return;
        return storage.removeItem(key);
    };

    const removeSessionToken = (key: string) => {
        if (!session) return;
        return session.removeItem(key);
    };

    const clear = () => {
        if (storage) storage.clear();
        if (session) session.clear();
    };

    const getItemSessionStorage = (key: string) => {
        if (!session) return null;
        const item = session.getItem(key);
        if (item && isJsonString(item)) {
            return JSON.parse(item);
        }
        return item;
    };

    const setItemSessionStorage = (key: string, value: string) => {
        if (!session) return;
        return session.setItem(key, JSON.stringify(value));
    };

    const isJsonString = (str: string) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    return {
        getItem,
        setItem,
        removeItem,
        removeSessionToken,
        clear,
        getItemSessionStorage,
        setItemSessionStorage,
        isJsonString,
    };
};

