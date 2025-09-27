import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthApi from '../API/AuthApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const data = await AuthApi.login(email, password);
      const { role, username, boutiqueId } = data;

      const userData = { email: username, role, boutiqueId };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (err) {
      setError('Email ou mot de passe incorrect.');
      return false;
    } finally {
      setLoading(false);

    }
  };

  const logout = async () => {
    try {
      await AuthApi.logout();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('password');
      setUser(null);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = () => user?.role === 'ADMIN';
  const isSeller = () => user?.role === 'VENDEUR';

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        isSeller,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
