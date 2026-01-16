export interface User {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    tenant_id: number;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => Promise<User>;
    logout: () => void;
}
