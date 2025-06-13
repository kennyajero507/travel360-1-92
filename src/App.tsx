
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/role/RoleProvider";
import AuthGuard from "./components/auth/AuthGuard";

// Import pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Quotes from "./pages/Quotes";
import CreateQuote from "./pages/CreateQuote";
import EditQuote from "./pages/EditQuote";
import QuotePreview from "./pages/QuotePreview";
import Inquiries from "./pages/Inquiries";
import CreateInquiry from "./pages/CreateInquiry";
import EditInquiry from "./pages/EditInquiry";
import Bookings from "./pages/Bookings";
import CreateBooking from "./pages/CreateBooking";
import BookingDetails from "./pages/BookingDetails";
import Hotels from "./pages/Hotels";
import CreateHotel from "./pages/CreateHotel";
import EditHotel from "./pages/EditHotel";
import HotelDetails from "./pages/HotelDetails";
import Settings from "./pages/Settings";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";

import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalErrorBoundary>
        <AuthProvider>
          <RoleProvider>
            <Router>
              <div className="App">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  
                  {/* Protected application routes */}
                  <Route 
                    path="/app/dashboard" 
                    element={
                      <AuthGuard>
                        <Dashboard />
                      </AuthGuard>
                    } 
                  />
                  
                  {/* Quote Management */}
                  <Route 
                    path="/quotes" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator', 'agent']}>
                        <Quotes />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/quotes/create" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator', 'agent']}>
                        <CreateQuote />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/quotes/edit/:id" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator', 'agent']}>
                        <EditQuote />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/quotes/:id/preview" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator', 'agent']}>
                        <QuotePreview />
                      </AuthGuard>
                    } 
                  />
                  
                  {/* Inquiry Management */}
                  <Route 
                    path="/inquiries" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator', 'agent']}>
                        <Inquiries />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/inquiries/create" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator', 'agent']}>
                        <CreateInquiry />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/inquiries/edit/:id" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator', 'agent']}>
                        <EditInquiry />
                      </AuthGuard>
                    } 
                  />
                  
                  {/* Booking Management */}
                  <Route 
                    path="/bookings" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator', 'agent']}>
                        <Bookings />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/bookings/create" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator', 'agent']}>
                        <CreateBooking />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/bookings/:id" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator', 'agent']}>
                        <BookingDetails />
                      </AuthGuard>
                    } 
                  />
                  
                  {/* Hotel Management */}
                  <Route 
                    path="/hotels" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator']}>
                        <Hotels />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/hotels/create" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator']}>
                        <CreateHotel />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/hotels/edit/:id" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator']}>
                        <EditHotel />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/hotels/:id" 
                    element={
                      <AuthGuard allowedRoles={['org_owner', 'tour_operator']}>
                        <HotelDetails />
                      </AuthGuard>
                    } 
                  />
                  
                  {/* Settings */}
                  <Route 
                    path="/settings" 
                    element={
                      <AuthGuard>
                        <Settings />
                      </AuthGuard>
                    } 
                  />
                  
                  {/* Admin routes */}
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <AuthGuard allowedRoles={['system_admin']}>
                        <AdminDashboard />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/admin/settings" 
                    element={
                      <AuthGuard allowedRoles={['system_admin']}>
                        <AdminSettings />
                      </AuthGuard>
                    } 
                  />
                  
                  {/* Fallback redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'white',
                      color: 'black',
                      border: '1px solid #e2e8f0',
                    },
                  }}
                />
              </div>
            </Router>
          </RoleProvider>
        </AuthProvider>
      </GlobalErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
