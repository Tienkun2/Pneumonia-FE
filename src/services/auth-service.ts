export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'doctor';
    avatar?: string;
}

const MOCK_USER: User = {
    id: '1',
    email: 'admin@cdss.com',
    name: 'Bác sĩ Admin',
    role: 'admin',
    avatar: '',
};

export const AuthService = {
    async login(email: string, password: string): Promise<{ user: User; token: string }> {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock validation (accept any non-empty credentials for now, or specific ones)
        if (email && password) {
            return {
                user: { ...MOCK_USER, email },
                token: 'mock-jwt-token-123456',
            };
        }

        throw new Error('Email hoặc mật khẩu không chính xác');
    },

    async logout(): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 500));
        localStorage.removeItem('token');
    },

    // Helper to get token
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    },
};
