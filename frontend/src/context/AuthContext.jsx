import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('peer_token');
        const userData = localStorage.getItem('peer_user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('peer_token', token);
        localStorage.setItem('peer_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('peer_token');
        localStorage.removeItem('peer_user');
        setUser(null);
    };

    const updateUser = (userData) => {
        localStorage.setItem('peer_user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
