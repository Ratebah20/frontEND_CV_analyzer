'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService, { User } from '../services/auth-service';

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: any;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ne charger l'utilisateur que si l'utilisateur est authentifié
    if (AuthService.isAuthenticated()) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
