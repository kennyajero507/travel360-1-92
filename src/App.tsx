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
import AgentManagement from "./pages/AgentManagement";
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
                  <Route element={<AuthGuard />}>
                    <Route element={<Layout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/inquiries" element={<Inquiries />} />
                      <Route path="/inquiries/create" element={<CreateInquiry />} />
                      <Route path="/inquiries/:inquiryId" element={<EditInquiry />} />
                      <Route path="/quotes" element={<Quotes />} />
                      <Route path="/quotes/create" element={<CreateQuote />} />
                      <Route path="/quotes/:quoteId" element={<EditQuote />} />
                      <Route path="/bookings" element={<Bookings />} />
                      <Route path="/bookings/create" element={<CreateBooking />} />
                      <Route path="/bookings/:bookingId" element={<BookingDetails />} />
                      <Route path="/hotels" element={<Hotels />} />
                      <Route path="/hotels/create" element={<CreateHotel />} />
                      <Route path="/hotels/:hotelId" element={<HotelDetails />} />
                      <Route path="/hotels/:hotelId/edit" element={<EditHotel />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/invoices/create" element={<CreateInvoice />} />
                      <Route path="/vouchers" element={<Vouchers />} />
                      <Route path="/vouchers/:voucherId" element={<VoucherDetails />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/settings" element={<Settings />} />
                      
                      {/* Admin routes */}
                      <Route element={<AuthGuard allowedRoles={['system_admin']} />}>
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/settings" element={<AdminSettings />} />
                      </Route>
                      
                      {/* Management routes */}
                      <Route element={<AuthGuard allowedRoles={['system_admin', 'org_owner', 'tour_operator']} />}>
                        <Route path="/team" element={<TeamManagement />} />
                        <Route path="/agents" element={<AgentManagement />} />
                      </Route>
                    </Route>
                  </Route>

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
