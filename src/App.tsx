
import React from 'react';
import {
  Routes,
  Route,
} from "react-router-dom";
import './App.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Quotes from './pages/Quotes';
import Hotels from './pages/Hotels';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Inquiries from './pages/Inquiries';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/quotes" element={<Layout><Quotes /></Layout>} />
        <Route path="/clients" element={<Layout><Clients /></Layout>} />
        <Route path="/hotels" element={<Layout><Hotels /></Layout>} />
        <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/inquiries" element={<Layout><Inquiries /></Layout>} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/dashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/settings" element={<Layout><AdminSettings /></Layout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
