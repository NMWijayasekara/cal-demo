import apiInstance from '@/axios/instance';
import Loader from '@/components/Loader';
import Login from '@/components/Login';
import { useRouter } from 'next/navigation';
import React, { createContext, PropsWithChildren, useContext, useEffect, useState, useCallback } from 'react';

interface AuthContextType {
    user: any;
    setUser: React.Dispatch<React.SetStateAction<any>>;
    login: (data: any) => Promise<unknown>;
    createUser: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => { },
    login: async () => { },
    createUser: async () => { },
    logout: async () => { },
    checkAuth: async () => { },
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const login = async (data: any) => {
        try {
            setLoading(true)
            const response = await apiInstance.post('/api/v1/auth/login', data);

            console.log(response)

            setLoading(false)

            const responseData = await response.data.data;
            setUser(responseData);
            router.push("/admin/bookings")
        } catch (error) {
            console.error(error);
            return error
        } finally {
            setLoading(false)
        };
    }

    const createUser = async (data: any): Promise<void> => {
        setLoading(true)
        const response = await apiInstance.post('/api/v1/auth/create-user', data);

        setLoading(false)

        const responseData = await response.data.data;
        setUser(responseData);
    };

    const logout = async () => {
        setLoading(true)
        const response = await apiInstance.get('/api/v1/auth/logout');

        setLoading(false)

        const responseData = await response.data.data;
        setUser(responseData);
    };

    const checkAuth = useCallback(async () => {
        try {
            const response = await apiInstance.get('/api/v1/auth/check-auth');

            const responseData = await response.data.data;

            setUser(responseData);
            router.push("/admin/bookings")
        } catch (error) {
            console.error(error);
        }
    });

    useEffect(() => {
        checkAuth();
    }, [])

    if (loading) {
        return <Loader />
    }

    return (
        <AuthContext.Provider value={{ user, setUser, login, createUser, logout, checkAuth }}>
            {user ? children : <Login />}
        </AuthContext.Provider>
    );
};