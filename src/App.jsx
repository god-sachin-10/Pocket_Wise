import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ToastContainer from './components/ToastContainer';

// Pages
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Overview from './pages/Overview';
import Transactions from './pages/Transactions';
import SavingsGoals from './pages/SavingsGoals';
import Commitments from './pages/Commitments';
import UnexpectedExpenses from './pages/UnexpectedExpenses';
import FinancialHealth from './pages/FinancialHealth';
import Settings from './pages/Settings';

// Page title mapping
const PAGE_TITLES = {
  '/': 'Overview',
  '/transactions': 'Transactions',
  '/savings': 'Savings Goals',
  '/commitments': 'Commitments & Subscriptions',
  '/unexpected-expenses': 'Unexpected Expenses',
  '/health': 'Financial Health',
  '/settings': 'Settings',
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner dark" style={{ width: 36, height: 36, borderWidth: 3 }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Loading Pocketwise…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

// Redirect if already signed in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

// Dashboard layout wrapper
const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const title = PAGE_TITLES[location.pathname] || 'Pocketwise';

  return (
    <FinanceProvider>
      <div className="app-shell">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-content">
          <Topbar title={title} onMenuToggle={() => setSidebarOpen(true)} />
          <main className="page-content">
            {children}
          </main>
        </div>
        <ToastContainer />
      </div>
    </FinanceProvider>
  );
};

const App = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/signin" element={
        <PublicRoute><SignIn /></PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute><SignUp /></PublicRoute>
      } />

      {/* Protected Dashboard Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout><Overview /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute>
          <DashboardLayout><Transactions /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/savings" element={
        <ProtectedRoute>
          <DashboardLayout><SavingsGoals /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/commitments" element={
        <ProtectedRoute>
          <DashboardLayout><Commitments /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/unexpected-expenses" element={
        <ProtectedRoute>
          <DashboardLayout><UnexpectedExpenses /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/health" element={
        <ProtectedRoute>
          <DashboardLayout><FinancialHealth /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardLayout><Settings /></DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
