import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getSession,
  saveSession,
  clearSession,
  findAccount,
  createAccount,
  hashPassword,
} from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const session = getSession();
    if (session) setUser(session);
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700)); // simulate network
    const account = findAccount(email);
    if (!account) {
      setLoading(false);
      throw new Error('No account found with this email. Please sign up first.');
    }
    if (account.passwordHash !== hashPassword(password)) {
      setLoading(false);
      throw new Error('Incorrect password. Please try again.');
    }
    const sessionUser = { id: account.id, name: account.name, email: account.email };
    saveSession(sessionUser);
    setUser(sessionUser);
    setLoading(false);
    return sessionUser;
  };

  const signUp = async (name, email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    if (findAccount(email)) {
      setLoading(false);
      throw new Error('An account with this email already exists. Please sign in.');
    }
    const account = createAccount(name, email, hashPassword(password));
    const sessionUser = { id: account.id, name: account.name, email: account.email };
    saveSession(sessionUser);
    setUser(sessionUser);
    setLoading(false);
    return sessionUser;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
