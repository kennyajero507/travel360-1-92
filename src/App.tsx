
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { RoleProvider } from "./contexts/role/RoleProvider";
import AuthGuard from "./components/auth/AuthGuard";
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";

// Auth pages
import SignIn from "./pages/SignIn";
import Signup from "./pages/Signup";
import Login from "./pages/Login"; // Keep for backward compatibility
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AcceptInvitation from "./pages/AcceptInvitation";

// Public pages
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";

// Protected app pages
import Dashboard from "./pages/Dashboard";
import Inquiries from "./pages/Inquiries";
import CreateInquiry from "./pages/CreateInquiry";
import EditInquiry from "./pages/EditInquiry";
import Quotes from "./pages/Quotes";
import CreateQuote from "./pages/CreateQuote";
import EditQuote from "./pages/EditQuote";
import QuotePreview from "./pages/QuotePreview";
import NormalizedQuoteEditor from "./pages/NormalizedQuoteEditor";
import Bookings from "./pages/Bookings";
import CreateBooking from "./pages/CreateBooking";
import BookingDetails from "./pages/BookingDetails";
import Hotels from "./pages/Hotels";
import CreateHotel from "./pages/CreateHotel";
import EditHotel from "./pages/EditHotel";
import HotelDetails from "./pages/HotelDetails";
import Clients from "./pages/Clients";
import TeamManagement from "./pages/TeamManagement";
import AgentManagement from "./pages/AgentManagement";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import Vouchers from "./pages/Vouchers";
import VoucherDetails from "./pages/VoucherDetails";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// Admin pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GlobalErrorBoundary>
          <BrowserRouter>
            <AuthProvider>
              <CurrencyProvider>
                <RoleProvider>
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/landing" element={<Landing />} />
                      <Route path="/home" element={<LandingPage />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/features" element={<Features />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/blog" element={<Blog />} />

                      {/* Auth routes */}
                      <Route path="/signin" element={<SignIn />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/login" element={<Login />} /> {/* Keep for backward compatibility */}
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/accept-invitation" element={<AcceptInvitation />} />

                      {/* Admin routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route
                        path="/admin/dashboard"
                        element={
                          <AuthGuard allowedRoles={["system_admin"]}>
                            <AdminDashboard />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/admin/settings"
                        element={
                          <AuthGuard allowedRoles={["system_admin"]}>
                            <AdminSettings />
                          </AuthGuard>
                        }
                      />

                      {/* Protected app routes - standardized with /app prefix */}
                      <Route
                        path="/app/dashboard"
                        element={
                          <AuthGuard>
                            <Dashboard />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/inquiries"
                        element={
                          <AuthGuard>
                            <Inquiries />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/inquiries/new"
                        element={
                          <AuthGuard>
                            <CreateInquiry />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/inquiries/:id/edit"
                        element={
                          <AuthGuard>
                            <EditInquiry />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/quotes"
                        element={
                          <AuthGuard>
                            <Quotes />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/quotes/new"
                        element={
                          <AuthGuard>
                            <CreateQuote />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/quotes/:id/edit"
                        element={
                          <AuthGuard>
                            <EditQuote />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/quotes/:id/preview"
                        element={
                          <AuthGuard>
                            <QuotePreview />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/quotes/:id/normalized"
                        element={
                          <AuthGuard>
                            <NormalizedQuoteEditor />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/bookings"
                        element={
                          <AuthGuard>
                            <Bookings />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/bookings/new"
                        element={
                          <AuthGuard>
                            <CreateBooking />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/bookings/:id"
                        element={
                          <AuthGuard>
                            <BookingDetails />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/hotels"
                        element={
                          <AuthGuard>
                            <Hotels />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/hotels/new"
                        element={
                          <AuthGuard>
                            <CreateHotel />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/hotels/:id/edit"
                        element={
                          <AuthGuard>
                            <EditHotel />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/hotels/:id"
                        element={
                          <AuthGuard>
                            <HotelDetails />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/clients"
                        element={
                          <AuthGuard>
                            <Clients />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/team"
                        element={
                          <AuthGuard allowedRoles={["org_owner", "tour_operator"]}>
                            <TeamManagement />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/agents"
                        element={
                          <AuthGuard allowedRoles={["org_owner", "tour_operator"]}>
                            <AgentManagement />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/invoices"
                        element={
                          <AuthGuard>
                            <Invoices />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/invoices/new"
                        element={
                          <AuthGuard>
                            <CreateInvoice />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/vouchers"
                        element={
                          <AuthGuard>
                            <Vouchers />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/vouchers/:id"
                        element={
                          <AuthGuard>
                            <VoucherDetails />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/calendar"
                        element={
                          <AuthGuard>
                            <Calendar />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/analytics"
                        element={
                          <AuthGuard>
                            <Analytics />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/reports"
                        element={
                          <AuthGuard>
                            <Reports />
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="/app/settings"
                        element={
                          <AuthGuard>
                            <Settings />
                          </AuthGuard>
                        }
                      />

                      {/* Legacy route redirects */}
                      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                      <Route path="/inquiries" element={<Navigate to="/app/inquiries" replace />} />
                      <Route path="/quotes" element={<Navigate to="/app/quotes" replace />} />
                      <Route path="/bookings" element={<Navigate to="/app/bookings" replace />} />
                      <Route path="/hotels" element={<Navigate to="/app/hotels" replace />} />
                      <Route path="/clients" element={<Navigate to="/app/clients" replace />} />
                      <Route path="/team" element={<Navigate to="/app/team" replace />} />
                      <Route path="/agents" element={<Navigate to="/app/agents" replace />} />
                      <Route path="/invoices" element={<Navigate to="/app/invoices" replace />} />
                      <Route path="/vouchers" element={<Navigate to="/app/vouchers" replace />} />
                      <Route path="/calendar" element={<Navigate to="/app/calendar" replace />} />
                      <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
                      <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
                      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

                      {/* Catch all - redirect to home */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </RoleProvider>
              </CurrencyProvider>
            </AuthProvider>
          </BrowserRouter>
        </GlobalErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
