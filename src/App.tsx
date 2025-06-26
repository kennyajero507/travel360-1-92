import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/auth/AuthGuard";
import WorkspaceInitializer from "./components/auth/WorkspaceInitializer";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Quotes from "./pages/Quotes";
import Bookings from "./pages/Bookings";
import Itineraries from "./pages/Itineraries";
import Suppliers from "./pages/Suppliers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Team from "./pages/Team";
import OrganizationSetup from "./components/OrganizationSetup";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLayout from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected routes with workspace initialization */}
              <Route
                path="/dashboard"
                element={
                  <AuthGuard>
                    <WorkspaceInitializer>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </WorkspaceInitializer>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/clients"
                element={
                  <AuthGuard>
                    <WorkspaceInitializer>
                      <Layout>
                        <Clients />
                      </Layout>
                    </WorkspaceInitializer>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/quotes"
                element={
                  <AuthGuard>
                    <WorkspaceInitializer>
                      <Layout>
                        <Quotes />
                      </Layout>
                    </WorkspaceInitializer>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/bookings"
                element={
                  <AuthGuard>
                    <WorkspaceInitializer>
                      <Layout>
                        <Bookings />
                      </Layout>
                    </WorkspaceInitializer>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/itineraries"
                element={
                  <AuthGuard>
                    <WorkspaceInitializer>
                      <Layout>
                        <Itineraries />
                      </Layout>
                    </WorkspaceInitializer>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/suppliers"
                element={
                  <AuthGuard>
                    <WorkspaceInitializer>
                      <Layout>
                        <Suppliers />
                      </Layout>
                    </WorkspaceInitializer>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/reports"
                element={
                  <AuthGuard>
                    <WorkspaceInitializer>
                      <Layout>
                        <Reports />
                      </Layout>
                    </WorkspaceInitializer>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <AuthGuard>
                    <WorkspaceInitializer>
                      <Layout>
                        <Settings />
                      </Layout>
                    </WorkspaceInitializer>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/profile"
                element={
                  <AuthGuard>
                    <WorkspaceInitializer>
                      <Layout>
                        <Profile />
                      </Layout>
                    </WorkspaceInitializer>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/team"
                element={
                  <AuthGuard allowedRoles={["org_owner", "tour_operator"]}>
                    <WorkspaceInitializer>
                      <Layout>
                        <Team />
                      </Layout>
                    </WorkspaceInitializer>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/organization-setup"
                element={
                  <AuthGuard>
                    <OrganizationSetup />
                  </AuthGuard>
                }
              />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              <Route
                path="/admin/dashboard"
                element={
                  <AuthGuard allowedRoles={["system_admin"]}>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/admin/users"
                element={
                  <AuthGuard allowedRoles={["system_admin"]}>
                    <AdminLayout>
                      <AdminUsers />
                    </AdminLayout>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/admin/organizations"
                element={
                  <AuthGuard allowedRoles={["system_admin"]}>
                    <AdminLayout>
                      <AdminOrganizations />
                    </AdminLayout>
                  </AuthGuard>
                }
              />
              
              <Route
                path="/admin/settings"
                element={
                  <AuthGuard allowedRoles={["system_admin"]}>
                    <AdminLayout>
                      <AdminSettings />
                    </AdminLayout>
                  </AuthGuard>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
