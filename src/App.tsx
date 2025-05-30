import React from 'react';
import {
  Routes,
  Route,
  Navigate,
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
import CreateInquiry from './pages/CreateInquiry';
import Landing from './pages/Landing';
import About from './pages/About';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import CreateQuote from './pages/CreateQuote';
import EditQuote from './pages/EditQuote';
import QuotePreview from './pages/QuotePreview';
import CreateHotel from './pages/CreateHotel';
import EditHotel from './pages/EditHotel';
import HotelDetails from './pages/HotelDetails';
import EditInquiry from './pages/EditInquiry';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import Vouchers from './pages/Vouchers';
import VoucherDetails from './pages/VoucherDetails';
import AgentManagement from './pages/AgentManagement';
import TeamManagement from './pages/TeamManagement';
import AcceptInvitation from './pages/AcceptInvitation';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoleProvider } from './contexts/role/RoleProvider';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthGuard } from './components/auth/AuthGuard';

// Protected route component
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[] 
}) => {
  return (
    <AuthGuard allowedRoles={allowedRoles} requireAuth={true}>
      {children}
    </AuthGuard>
  );
};

// Public route component that redirects authenticated users
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, userProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect authenticated users to their appropriate dashboard
  if (session && userProfile) {
    if (userProfile.role === 'system_admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

// Guest route component for public pages
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
        <Route path="/about" element={<GuestRoute><About /></GuestRoute>} />
        <Route path="/features" element={<GuestRoute><Features /></GuestRoute>} />
        <Route path="/pricing" element={<GuestRoute><Pricing /></GuestRoute>} />
        
        {/* Authentication routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        
        {/* Invitation acceptance route */}
        <Route path="/invite" element={<AcceptInvitation />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout><Calendar /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Quote management routes */}
        <Route path="/quotes" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
            <Layout><Quotes /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/quotes/create" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
            <Layout><CreateQuote /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/quotes/:id/edit" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
            <Layout><EditQuote /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/quotes/:id/preview" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
            <Layout><QuotePreview /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Client management routes */}
        <Route path="/clients" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
            <Layout><Clients /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Hotel management routes */}
        <Route path="/hotels" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator']}>
            <Layout><Hotels /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/hotels/create" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator']}>
            <Layout><CreateHotel /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/hotels/:id/edit" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator']}>
            <Layout><EditHotel /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/hotels/:id" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator']}>
            <Layout><HotelDetails /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Inquiry management routes */}
        <Route path="/inquiries" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
            <Layout><Inquiries /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/inquiries/create" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
            <Layout><CreateInquiry /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/inquiries/:id/edit" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
            <Layout><EditInquiry /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Booking management routes */}
        <Route path="/bookings" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
            <Layout><Bookings /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/bookings/:id" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
            <Layout><BookingDetails /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Voucher management routes */}
        <Route path="/vouchers" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
            <Layout><Vouchers /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/vouchers/:id" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator', 'agent']}>
            <Layout><VoucherDetails /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Team Management routes */}
        <Route path="/team" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator']}>
            <Layout><TeamManagement /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Legacy Agent management routes (keeping for backward compatibility) */}
        <Route path="/agents" element={
          <ProtectedRoute allowedRoles={['system_admin', 'org_owner', 'tour_operator']}>
            <Layout><AgentManagement /></Layout>
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
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen">
      <AuthProvider>
        <RoleProvider>
          <CurrencyProvider>
            <AppRoutes />
          </CurrencyProvider>
        </RoleProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
