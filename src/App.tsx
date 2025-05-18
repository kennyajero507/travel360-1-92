
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, RoleContext } from './contexts/RoleContext';
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

interface LayoutProps {
  children: React.ReactNode;
}

function App() {
  const { currentUser } = useContext(RoleContext);

  // Define a function to check if the user is authenticated
  const isAuthenticated = () => {
    return currentUser && currentUser.role; // Adjust this based on your actual authentication logic
  };

  // Create a wrapper component for protected routes
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated()) {
      // Redirect to the login page if not authenticated
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <RoleProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/calendar" element={
            <Layout>
              <Calendar />
            </Layout>
          } />
          <Route path="/hotels" element={
            <Layout>
              <Hotels />
            </Layout>
          } />
          <Route path="/hotels/:hotelId" element={
            <Layout>
              <HotelDetails />
            </Layout>
          } />
          <Route path="/hotels/edit/:hotelId" element={
            <Layout>
              <EditHotel />
            </Layout>
          } />
          <Route path="/hotels/create" element={
            <Layout>
              <CreateHotel />
            </Layout>
          } />
          <Route path="/clients" element={
            <Layout>
              <Clients />
            </Layout>
          } />
          <Route path="/inquiries" element={
            <Layout>
              <Inquiries />
            </Layout>
          } />
          <Route path="/inquiries/create" element={
            <Layout>
              <CreateInquiry />
            </Layout>
          } />
          <Route path="/quotes" element={
            <Layout>
              <Quotes />
            </Layout>
          } />
          <Route path="/quotes/create" element={
            <Layout>
              <CreateQuote />
            </Layout>
          } />
          <Route path="/quotes/edit/:quoteId" element={
            <Layout>
              <EditQuote />
            </Layout>
          } />
          <Route path="/quote-preview" element={
            <Layout>
              <QuotePreview />
            </Layout>
          } />
          {/* Add new routes for bookings and vouchers */}
          <Route path="/bookings" element={
            <Layout>
              <Bookings />
            </Layout>
          } />
          <Route path="/bookings/:bookingId" element={
            <Layout>
              <BookingDetails />
            </Layout>
          } />
          <Route path="/vouchers" element={
            <Layout>
              <Vouchers />
            </Layout>
          } />
          <Route path="/vouchers/:voucherId" element={
            <Layout>
              <VoucherDetails />
            </Layout>
          } />
          <Route path="/agents" element={
            <Layout>
              <AgentManagement />
            </Layout>
          } />
          <Route path="/settings" element={
            <Layout>
              <Settings />
            </Layout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </RoleProvider>
    </BrowserRouter>
  );
}

export default App;
