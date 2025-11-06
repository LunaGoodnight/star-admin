// Backend user structure
export interface User {
    username: string;
    role: string;
}

// Client-side token and user management
export const authManager = {
    getToken: () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    },

    setToken: (token: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    },

    removeToken: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    getUser: (): User | null => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    return JSON.parse(userStr) as User;
                } catch {
                    return null;
                }
            }
        }
        return null;
    },

    setUser: (user: User) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    isAuthenticated: () => {
        return !!authManager.getToken();
    },
};
