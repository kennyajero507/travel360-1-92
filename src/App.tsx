
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/RoleContext";
import Layout from "./components/Layout";
import AuthGuard from "./components/auth/AuthGuard";
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";
import NotFound from "./components/common/NotFound";
import Dashboard from "./pages/Dashboard";
import Hotels from "./pages/Hotels";
import CreateHotel from "./pages/CreateHotel";
import EditHotel from "./pages/EditHotel";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettingsPage from "./pages/admin/AdminSettings";
import Quotes from "./pages/Quotes";
import CreateQuote from "./pages/CreateQuote";
import EditQuote from "./pages/EditQuote";
import Inquiries from "./pages/Inquiries";
import CreateInquiry from "./pages/CreateInquiry";
import EditInquiry from "./pages/EditInquiry";
import Bookings from "./pages/Bookings";
import BookingDetails from "./pages/BookingDetails";
import Vouchers from "./pages/Vouchers";
import Clients from "./pages/Clients";
import Reports from "./pages/Reports";
import TeamManagementPage from "./pages/TeamManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      }
    },
  },
});

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <RoleProvider>
              <BrowserRouter>
                <div className="min-h-screen bg-background font-sans antialiased w-full">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Protected Routes */}
                    <Route
                      path="/"
                      element={
                        <AuthGuard>
                          <Layout />
                        </AuthGuard>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="dashboard" element={<Dashboard />} />

                      {/* Hotels */}
                      <Route path="hotels" element={<Hotels />} />
                      <Route path="hotels/create" element={<CreateHotel />} />
                      <Route path="hotels/:hotelId" element={<EditHotel />} />

                      {/* Quotes */}
                      <Route path="quotes" element={<Quotes />} />
                      <Route path="quotes/create" element={<CreateQuote />} />
                      <Route path="quotes/:quoteId" element={<EditQuote />} />

                      {/* Inquiries */}
                      <Route path="inquiries" element={<Inquiries />} />
                      <Route path="inquiries/create" element={<CreateInquiry />} />
                      <Route path="inquiries/:inquiryId" element={<EditInquiry />} />

                      {/* Bookings */}
                      <Route path="bookings" element={<Bookings />} />
                      <Route path="bookings/:id" element={<BookingDetails />} />

                      {/* Vouchers */}
                      <Route path="vouchers" element={<Vouchers />} />

                      {/* Clients */}
                      <Route path="clients" element={<Clients />} />

                      {/* Reports */}
                      <Route path="reports" element={<Reports />} />

                      {/* Team Management */}
                      <Route path="team" element={<TeamManagementPage />} />

                      {/* Settings */}
                      <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <AuthGuard allowedRoles={['system_admin']}>
                          <Layout />
                        </AuthGuard>
                      }
                    >
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                    </Route>

                    {/* 404 Route - Must be last */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </div>
              </BrowserRouter>
            </RoleProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
