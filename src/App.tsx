
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthErrorBoundary } from "./components/auth/AuthErrorBoundary";
import AuthGuard from "./components/auth/AuthGuard";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import OrganizationSetup from "./components/OrganizationSetup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Hotels from "./pages/Hotels";
import Inquiries from "./pages/Inquiries";
import Quotes from "./pages/Quotes";
import Bookings from "./pages/Bookings";
import BookingDetails from "./pages/BookingDetails";
import CreateInquiry from "./pages/CreateInquiry";
import CreateQuote from "./pages/CreateQuote";
import EditQuote from "./pages/EditQuote";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Clients from "./pages/Clients";
import Vouchers from "./pages/Vouchers";
import CreateHotel from "./pages/CreateHotel";
import HotelDetails from "./pages/HotelDetails";
import EditHotel from "./pages/EditHotel";
import EditInquiry from "./pages/EditInquiry";
import TeamManagementPage from "./pages/TeamManagement";
import AgentManagement from "./pages/AgentManagement";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route 
                path="/admin/login"
                element={<AdminLogin />}
              />

              {/* Protected Routes with Sidebar Layout */}
              <Route
                element={
                  <AuthGuard>
                    <Layout />
                  </AuthGuard>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      <AdminDashboard />
                    </AuthGuard>
                  }
                />
                <Route 
                  path="/organization/setup"
                  element={<OrganizationSetup />}
                />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/hotels/create" element={<CreateHotel />} />
                <Route path="/hotels/:hotelId" element={<HotelDetails />} />
                <Route path="/hotels/:hotelId/edit" element={<EditHotel />} />
                <Route path="/inquiries" element={<Inquiries />} />
                <Route path="/inquiries/create" element={<CreateInquiry />} />
                <Route path="/inquiries/edit/:inquiryId" element={<EditInquiry />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/quotes/create" element={<CreateQuote />} />
                <Route path="/quotes/:quoteId" element={<EditQuote />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/bookings/:id" element={<BookingDetails />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/vouchers" element={<Vouchers />} />
                <Route path="/team" element={<TeamManagementPage />} />
                <Route path="/agent-management" element={<AgentManagement />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AuthErrorBoundary>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
