import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        const savedUserStr = await AsyncStorage.getItem('user');
        if (savedToken && savedUserStr) {
          setToken(savedToken);
          setUser(JSON.parse(savedUserStr));
        }
      } catch (e) {
        console.error('Failed to load session', e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/login', { email, password });
      const { token: userToken, user: userData } = res.data;
      
      await AsyncStorage.setItem('token', userToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);
    } catch (err: any) {
      let msg = 'Login failed';
      if (err.response?.data?.errors) {
        const errorDetails = Object.values(err.response.data.errors).flat().join('\n');
        if (errorDetails) msg = errorDetails;
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      throw new Error(msg);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    try {
      const res = await api.post('/register', { name, email, phone, password });
      const { token: userToken, user: userData } = res.data;
      
      await AsyncStorage.setItem('token', userToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);
    } catch (err: any) {
      let msg = 'Registration failed';
      if (err.response?.data?.errors) {
        const errorDetails = Object.values(err.response.data.errors).flat().join('\n');
        if (errorDetails) msg = errorDetails;
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Failed to logout', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
