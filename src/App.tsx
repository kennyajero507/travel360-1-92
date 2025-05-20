
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import EditHotel from './pages/EditHotel';
import CreateHotel from './pages/CreateHotel';
import Clients from './pages/Clients';
import Inquiries from './pages/Inquiries';
import CreateInquiry from './pages/CreateInquiry';
import Quotes from './pages/Quotes';
import CreateQuote from './pages/CreateQuote';
import EditQuote from './pages/EditQuote';
import QuotePreview from './pages/QuotePreview';
import AgentManagement from './pages/AgentManagement';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import Bookings from './pages/Bookings';
import BookingDetails from './pages/BookingDetails';
import Vouchers from './pages/Vouchers';
import VoucherDetails from './pages/VoucherDetails';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { RoleProvider } from './contexts/RoleContext';
import EditInquiry from './pages/EditInquiry';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoleProvider>
          <CurrencyProvider>
            <AppRoutes />
            <Toaster />
          </CurrencyProvider>
        </RoleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Separate component for routes to use the auth context
function AppRoutes() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Define a function to check if the user is authenticated
  const isAuthenticated = !!currentUser;

  // Create a wrapper component for protected routes
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      // Redirect to the login page if not authenticated
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  // Create a wrapper component for public routes (accessible only when not logged in)
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthenticated) {
      // Redirect to dashboard if already authenticated
      return <Navigate to="/dashboard" />;
    }
    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Public routes - accessible when not logged in */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected routes - require authentication */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute>
          <Layout>
            <Calendar />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/hotels" element={
        <ProtectedRoute>
          <Layout>
            <Hotels />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/hotels/:hotelId" element={
        <ProtectedRoute>
          <Layout>
            <HotelDetails />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/hotels/edit/:hotelId" element={
        <ProtectedRoute>
          <Layout>
            <EditHotel />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/hotels/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateHotel />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/clients" element={
        <ProtectedRoute>
          <Layout>
            <Clients />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/inquiries" element={
        <ProtectedRoute>
          <Layout>
            <Inquiries />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/inquiries/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateInquiry />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/inquiries/edit/:inquiryId" element={
        <ProtectedRoute>
          <Layout>
            <EditInquiry />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/quotes" element={
        <ProtectedRoute>
          <Layout>
            <Quotes />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/quotes/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateQuote />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/quotes/edit/:quoteId" element={
        <ProtectedRoute>
          <Layout>
            <EditQuote />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/quote-preview" element={
        <ProtectedRoute>
          <Layout>
            <QuotePreview />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/bookings" element={
        <ProtectedRoute>
          <Layout>
            <Bookings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/bookings/:bookingId" element={
        <ProtectedRoute>
          <Layout>
            <BookingDetails />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/vouchers" element={
        <ProtectedRoute>
          <Layout>
            <Vouchers />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/vouchers/:voucherId" element={
        <ProtectedRoute>
          <Layout>
            <VoucherDetails />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/agents" element={
        <ProtectedRoute>
          <Layout>
            <AgentManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
