import { createContext, useContext, useState } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await authApi.login(email, password);

      if (data.requiresTwoFactor) {
        throw new Error('Contul necesită 2FA — momentan nesuportat în acest panou');
      }

      localStorage.setItem('admin_token', data.token);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Eroare de autentificare');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);