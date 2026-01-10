import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type UserRole = 'artist' | 'sponsor' | 'creator';

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    console.log('Attempting login for username:', username);

    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role')
      .eq('username', username)
      .eq('password_hash', password)
      .maybeSingle();

    console.log('Login response:', { data, error });

    if (error) {
      console.error('Login error:', error);
      throw new Error(`Login failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Invalid username or password');
    }

    const userData = {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role as UserRole,
    };

    console.log('Login successful:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
