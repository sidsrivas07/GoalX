import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Authentication Removed: Providing a persistent anonymous user context
  const [user, setUser] = useState({ 
    id: '00000000-0000-0000-0000-000000000000', 
    name: 'Anonymous',
    email: 'anonymous@goalx.app'
  });
  const [token, setToken] = useState('anonymous-token');
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {};
  const signup = async () => {};
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
