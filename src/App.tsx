
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/RoleContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import AuthGuard from "./components/auth/AuthGuard";
import Layout from "./components/Layout";
import PublicLayout from "./components/PublicLayout";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AcceptInvitation from "./pages/AcceptInvitation";
import Dashboard from "./pages/Dashboard";
import Inquiries from "./pages/Inquiries";
import CreateInquiry from "./pages/CreateInquiry";
import EditInquiry from "./pages/EditInquiry";
import Quotes from "./pages/Quotes";
import CreateQuote from "./pages/CreateQuote";
import EditQuote from "./pages/EditQuote";
import QuotePreview from "./pages/QuotePreview";
import Hotels from "./pages/Hotels";
import CreateHotel from "./pages/CreateHotel";
import EditHotel from "./pages/EditHotel";
import HotelDetails from "./pages/HotelDetails";
import Bookings from "./pages/Bookings";
import CreateBooking from "./pages/CreateBooking";
import BookingDetails from "./pages/BookingDetails";
import Vouchers from "./pages/Vouchers";
import VoucherDetails from "./pages/VoucherDetails";
import Clients from "./pages/Clients";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import TeamManagement from "./pages/TeamManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <AuthProvider>
            <RoleProvider>
              <CurrencyProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<PublicLayout><Outlet /></PublicLayout>}>
                    <Route index element={<Landing />} />
                    <Route path="features" element={<Features />} />
                    <Route path="pricing" element={<Pricing />} />
                    <Route path="about" element={<About />} />
                  </Route>

                  {/* Auth routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
                  <Route path="/quote-preview/:quoteId" element={<QuotePreview />} />

                  {/* Admin routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <AuthGuard allowedRoles={['system_admin']}>
                        <Layout>
                          <AdminDashboard />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/admin/settings" 
                    element={
                      <AuthGuard allowedRoles={['system_admin']}>
                        <Layout>
                          <AdminSettings />
                        </Layout>
                      </AuthGuard>
                    } 
                  />

                  {/* Protected routes */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/inquiries" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <Inquiries />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/inquiries/create" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <CreateInquiry />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/inquiries/:inquiryId" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <EditInquiry />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/quotes" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <Quotes />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/quotes/create" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <CreateQuote />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/quotes/:quoteId" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <EditQuote />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/bookings" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <Bookings />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/bookings/create" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <CreateBooking />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/bookings/:bookingId" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <BookingDetails />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/hotels" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <Hotels />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/hotels/create" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <CreateHotel />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/hotels/:hotelId" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <HotelDetails />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/hotels/:hotelId/edit" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <EditHotel />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/clients" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <Clients />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/invoices" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <Invoices />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/invoices/create" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <CreateInvoice />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/vouchers" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <Vouchers />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/vouchers/:voucherId" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <VoucherDetails />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/calendar" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <Calendar />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <Analytics />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/reports" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <Reports />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <AuthGuard>
                        <Layout>
                          <Settings />
                        </Layout>
                      </AuthGuard>
                    } 
                  />
                  
                  {/* Team Management - consolidated route */}
                  <Route 
                    path="/team" 
                    element={
                      <AuthGuard allowedRoles={['system_admin', 'org_owner', 'tour_operator']}>
                        <Layout>
                          <TeamManagement />
                        </Layout>
                      </AuthGuard>
                    } 
                  />

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CurrencyProvider>
            </RoleProvider>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
