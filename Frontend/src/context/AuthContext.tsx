import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type LoginRequest } from '../services/authService';
import type { User, AuthContextType } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    // Opcional: Validar token con backend o decodificar
                    // Por simplicidad, persistimos usuario en localStorage también o hacemos fetch profile
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        try {
                            setUser(JSON.parse(storedUser));
                        } catch (e) {
                            console.error('Error parsing stored user', e);
                            localStorage.removeItem('user');
                        }
                    }
                } catch (error) {
                    console.error('Error restoring session', error);
                    logout();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (data: LoginRequest) => {
        const response = await authService.login(data);
        setToken(response.access_token);
        setUser(response.user);

        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return response.user;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
