import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.error('Failed to fetch user', err);
      // Fallback for dev/mock
      setUser({ id: '00000000-0000-0000-0000-000000000000', name: 'Anonymous' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async () => {};
  const signup = async () => {};
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
