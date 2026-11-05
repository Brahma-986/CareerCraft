import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('careercraft_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then((response) => setUser(response.data.data.user))
      .catch(() => localStorage.removeItem('careercraft_token'))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async register(payload) {
      const response = await api.post('/auth/register', payload);
      localStorage.setItem('careercraft_token', response.data.data.token);
      setUser(response.data.data.user);
      return response.data;
    },
    async login(payload) {
      const response = await api.post('/auth/login', payload);
      localStorage.setItem('careercraft_token', response.data.data.token);
      setUser(response.data.data.user);
      return response.data;
    },
    logout() {
      localStorage.removeItem('careercraft_token');
      setUser(null);
    },
    setUser,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export { getErrorMessage };
