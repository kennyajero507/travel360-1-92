
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SimpleAuthProvider } from "./contexts/SimpleAuthContext";
import { SimpleAuthGuard } from "./components/auth/SimpleAuthGuard";
import DashboardLayout from "./components/layout/DashboardLayout";
import SimpleLogin from "./pages/SimpleLogin";
import SimpleSignup from "./pages/SimpleSignup";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrganizationManagement from "./pages/admin/OrganizationManagement";
import UserManagement from "./pages/admin/UserManagement";
import SubscriptionManagement from "./pages/admin/SubscriptionManagement";
import Dashboard from "./pages/Dashboard";
import InquiriesPage from "./pages/inquiries/InquiriesPage";
import CreateInquiryPage from "./pages/inquiries/CreateInquiryPage";
import QuotesPage from "./pages/quotes/QuotesPage";
import CreateQuotePage from "./pages/quotes/CreateQuotePage";
import EditQuotePage from "./pages/quotes/EditQuotePage";
import QuotePreviewPage from "./pages/quotes/QuotePreviewPage";
import BookingsPage from "./pages/BookingsPage";
import BookingCreatePage from "./pages/BookingCreatePage";
import ReportsPage from "./pages/ReportsPage";
import TransportPage from "./pages/TransportPage";
import HotelsPage from "./pages/HotelsPage";
import TeamPage from "./pages/TeamPage";
import DestinationsPage from "./pages/DestinationsPage";
import SettingsPage from "./pages/SettingsPage";
import OrganizationSetup from "./components/OrganizationSetup";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<SimpleLogin />} />
              <Route path="/signup" element={<SimpleSignup />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/organizations" element={<OrganizationManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/subscriptions" element={<SubscriptionManagement />} />
              <Route path="/organization/setup" element={<OrganizationSetup />} />
              
              {/* Protected routes */}
              <Route path="/" element={<DashboardLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="inquiries" element={<InquiriesPage />} />
                <Route path="inquiries/create" element={<CreateInquiryPage />} />
                <Route path="quotes" element={<QuotesPage />} />
                <Route path="quotes/create" element={<CreateQuotePage />} />
                <Route path="quotes/:id/edit" element={<EditQuotePage />} />
                <Route path="quotes/:id/preview" element={<QuotePreviewPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="bookings/create" element={<BookingCreatePage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="transport" element={<TransportPage />} />
                <Route path="hotels" element={<HotelsPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="destinations" element={<DestinationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                {/* Add more protected routes here */}
              </Route>
              
              {/* Default redirect */}
              <Route index element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SimpleAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
