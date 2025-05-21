
import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import './App.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Quotes from './pages/Quotes';
import Hotels from './pages/Hotels';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Inquiries from './pages/Inquiries';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoleProvider } from './contexts/role/RoleProvider';
import { CurrencyProvider } from './contexts/CurrencyContext';

// Protected route component that checks authentication
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[] 
}) => {
  const { session, userProfile, loading, checkRoleAccess } = useAuth();
  const location = useLocation();
  
  if (loading) {
    // Show loading state while checking auth
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!session) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If roles are specified, check if user has permission
  if (allowedRoles.length > 0 && userProfile) {
    const hasAccess = checkRoleAccess(allowedRoles);
    if (!hasAccess) {
      // Redirect to dashboard with access denied message
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // User is authenticated and has permission
  return <>{children}</>;
};

// Route that redirects authenticated users
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (session) {
    // Redirect to dashboard if already logged in
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      
      {/* Protected routes for all authenticated users */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Layout><Calendar /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
      
      {/* Role-specific routes */}
      <Route path="/quotes" element={
        <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
          <Layout><Quotes /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/clients" element={
        <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
          <Layout><Clients /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/hotels" element={
        <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator']}>
          <Layout><Hotels /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/inquiries" element={
        <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
          <Layout><Inquiries /></Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin-only routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['system_admin']}>
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={['system_admin']}>
          <Layout><AdminSettings /></Layout>
        </ProtectedRoute>
      } />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <CurrencyProvider>
          <AppRoutes />
        </CurrencyProvider>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
