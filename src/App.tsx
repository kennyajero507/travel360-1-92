
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <NotFound />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: "/dashboard",
    element: <Layout><Dashboard /></Layout>,
  },
  {
    path: "/quotes",
    element: <Layout><Quotes /></Layout>,
  },
  {
    path: "/clients",
    element: <Layout><Clients /></Layout>,
  },
  {
    path: "/hotels",
    element: <Layout><Hotels /></Layout>,
  },
  {
    path: "/calendar",
    element: <Layout><Calendar /></Layout>,
  },
  {
    path: "/settings",
    element: <Layout><Settings /></Layout>,
  },
  {
    path: "/inquiries",
    element: <Layout><Inquiries /></Layout>,
  },
  {
    path: "/admin-login",
    element: <AdminLogin />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/admin/dashboard",
    element: <Layout><AdminDashboard /></Layout>,
  },
  {
    path: "/admin/settings",
    element: <Layout><AdminSettings /></Layout>,
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
