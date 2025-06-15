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
import AdminLayout from "./components/admin/AdminLayout";
import Landing from "./pages/Landing"; // Import the correct landing page
import HotelRoomManagementPage from "./pages/HotelRoomManagementPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/quote-preview" element={<QuotePreview />} />
              <Route 
                path="/admin/login"
                element={<AdminLogin />}
              />

              {/* Admin Portal: ALL /admin* routes get wrapped in AdminLayout */}
              <Route
                path="/admin"
                element={
                  <AuthGuard allowedRoles={['system_admin']}>
                    <AdminLayout />
                  </AuthGuard>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="health" element={<AdminSystemHealth />} />
                <Route path="analytics" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUserManagement />} />
                <Route path="organizations" element={<AdminOrganizationManagement />} />
                <Route path="roles" element={<AdminRoles />} />
                <Route path="database" element={<AdminDatabase />} />
                <Route path="logs" element={<AdminLogs />} />
                <Route path="monitoring" element={<AdminMonitoring />} />
                <Route path="security" element={<AdminDashboard />} />
                <Route path="audit" element={<AdminAuditLogs />} />
                <Route path="access" element={<AdminAccessControl />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="templates" element={<AdminEmailTemplates />} />
                <Route path="maintenance" element={<AdminMaintenance />} />
              </Route>

              {/* User Portal: All non-admin features go here */}
              <Route
                element={
                  <AuthGuard>
                    <Layout />
                  </AuthGuard>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route 
                  path="/organization/setup"
                  element={<OrganizationSetup />}
                />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/hotels/create" element={<CreateHotel />} />
                <Route path="/hotels/:hotelId" element={<HotelDetails />} />
                <Route path="/hotels/:hotelId/edit" element={<EditHotel />} />
                <Route path="/hotels/:hotelId/rooms" element={<HotelRoomManagementPage />} />
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
