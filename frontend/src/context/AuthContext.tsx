import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: string | null;
  login: (token: string, role: string, userId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  userId: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));

  const login = (newToken: string, newRole: string, newUserId?: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    if (newUserId) {
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    }
    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setToken(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);