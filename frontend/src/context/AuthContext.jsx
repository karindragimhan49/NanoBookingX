import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('gt_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then(data => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('gt_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (tokenValue, userData) => {
    localStorage.setItem('gt_token', tokenValue);
    setToken(tokenValue);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('gt_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
