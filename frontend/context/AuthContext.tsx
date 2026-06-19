'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

interface User {
  id: number;
  fullName: string;
  email: string;
  profilePhotoUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (fullName: string | undefined, email: string | undefined) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = Cookies.get('token');
    if (savedToken) {
      setToken(savedToken);
      api.get<User>('/user/profile')
        .then(res => setUser(res.data))
        .catch(() => logout())
        .then(() => setIsLoading(false)); // Replacing finally with then to avoid TypeScript Promise error with some configs
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    const res = await api.get<User>('/user/profile');
    setUser(res.data);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string }>('/auth/login', { email, password });
    const { token } = res.data;
    Cookies.set('token', token, { expires: 1 });
    setToken(token);
    const profileRes = await api.get<User>('/user/profile');
    setUser(profileRes.data);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await api.post<{ token: string }>('/auth/register', { fullName, email, password });
    const { token } = res.data;
    Cookies.set('token', token, { expires: 1 });
    setToken(token);
    const profileRes = await api.get<User>('/user/profile');
    setUser(profileRes.data);
  };

  const updateProfile = async (fullName?: string, email?: string) => {
    const res = await api.put<{ user: User, token?: string }>('/user/profile', { fullName, email });
    const { user: updatedUser, token: newToken } = res.data;

    if (newToken) {
      Cookies.set('token', newToken, { expires: 1 });
      setToken(newToken);
    }

    setUser(updatedUser);
  };

  const logout = () => {
    Cookies.remove('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}