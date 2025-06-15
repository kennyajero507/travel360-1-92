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
import InquiryDetails from "./pages/InquiryDetails";
import EditInquiry from "./pages/EditInquiry";
import TeamManagementPage from "./pages/TeamManagement";
import AgentManagement from "./pages/AgentManagement";
import VoucherDetailsPage from "./pages/VoucherDetailsPage";
import QuotePreview from "./pages/QuotePreview";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import CreateBookingPage from './pages/CreateBookingPage';
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminOrganizationManagement from "./pages/admin/AdminOrganizationManagement";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSystemHealth from "./pages/admin/AdminSystemHealth";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminDatabase from "./pages/admin/AdminDatabase";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminMonitoring from "./pages/admin/AdminMonitoring";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminAccessControl from "./pages/admin/AdminAccessControl";
import AdminEmailTemplates from "./pages/admin/AdminEmailTemplates";
import AdminMaintenance from "./pages/admin/AdminMaintenance";

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
              <Route path="/quote-preview" element={<QuotePreview />} />
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
                <Route path="/inquiries/:inquiryId" element={<InquiryDetails />} />
                <Route path="/inquiries/edit/:inquiryId" element={<EditInquiry />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/quotes/create" element={<CreateQuote />} />
                <Route path="/quotes/:quoteId" element={<EditQuote />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/bookings/create" element={<CreateBookingPage />} />
                <Route path="/bookings/:id" element={<BookingDetails />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/:clientId" element={<ClientDetailsPage />} />
                <Route path="/vouchers" element={<Vouchers />} />
                <Route path="/vouchers/:voucherId" element={<VoucherDetailsPage />} />
                <Route path="/team" element={<TeamManagementPage />} />
                <Route path="/agent-management" element={<AgentManagement />} />
                <Route
                  path="/admin/health"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      <AdminSystemHealth />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      {/* Reuse AdminDashboard for now */}
                      <AdminDashboard />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      <AdminUserManagement />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/admin/organizations"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      <AdminOrganizationManagement />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/admin/roles"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      <AdminRoles />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/admin/database"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      <AdminDatabase />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/admin/logs"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      <AdminLogs />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/admin/monitoring"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      <AdminMonitoring />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/admin/security"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      {/* Reuse AdminDashboard for now */}
                      <AdminDashboard />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/admin/audit"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      <AdminAuditLogs />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/admin/access"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      <AdminAccessControl />
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
                <Route
                  path="/admin/templates"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      <AdminEmailTemplates />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/admin/maintenance"
                  element={
                    <AuthGuard allowedRoles={['system_admin']}>
                      <AdminMaintenance />
                    </AuthGuard>
                  }
                />
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
