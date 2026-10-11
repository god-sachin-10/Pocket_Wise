/**
 * Pocketwise Storage Utility
 * All localStorage operations go through this module.
 * DEMO ONLY — not production-secure. Do not store real credentials.
 */

const STORAGE_VERSION = '1.0.0';
const ACCOUNTS_KEY = 'pocketwise_accounts';
const SESSION_KEY = 'pocketwise_session';
const FINANCE_KEY_PREFIX = 'pocketwise_finance_';

// ─── Accounts ─────────────────────────────────────────────────────────────────

export const getAccounts = () => {
  try {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveAccounts = (accounts) => {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const findAccount = (email) => {
  return getAccounts().find(a => a.email.toLowerCase() === email.toLowerCase());
};

export const createAccount = (name, email, passwordHash) => {
  const accounts = getAccounts();
  const account = {
    id: `user_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
    version: STORAGE_VERSION,
  };
  accounts.push(account);
  saveAccounts(accounts);
  return account;
};

// Very basic hash for demo purposes only — NOT cryptographically secure
export const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `demo_${Math.abs(hash).toString(36)}`;
};

// ─── Session ──────────────────────────────────────────────────────────────────

export const getSession = () => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveSession = (user) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...user, sessionAt: new Date().toISOString() }));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// ─── Finance Data ─────────────────────────────────────────────────────────────

export const getFinanceData = (userId) => {
  try {
    const data = localStorage.getItem(`${FINANCE_KEY_PREFIX}${userId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveFinanceData = (userId, data) => {
  localStorage.setItem(`${FINANCE_KEY_PREFIX}${userId}`, JSON.stringify({
    ...data,
    _savedAt: new Date().toISOString(),
    _version: STORAGE_VERSION,
  }));
};

export const clearFinanceData = (userId) => {
  localStorage.removeItem(`${FINANCE_KEY_PREFIX}${userId}`);
};
