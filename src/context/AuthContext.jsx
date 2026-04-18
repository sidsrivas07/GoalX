import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('goalx_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Rejuvenate the user object on mount if a token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await api.get('/auth/me');
        setUser(userData);
      } catch (error) {
        console.error('Invalid token, logging out', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      handleAuthSuccess(data);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const data = await api.post('/auth/signup', { name, email, password });
      handleAuthSuccess(data);
    } catch (error) {
      throw error;
    }
  };

  const handleAuthSuccess = (data) => {
    localStorage.setItem('goalx_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('goalx_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
