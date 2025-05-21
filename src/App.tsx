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
import InquiryDetail from './pages/inquiries/InquiryDetail';
import InquiryEdit from './pages/inquiries/InquiryEdit';
import InquiryCreate from './pages/inquiries/InquiryCreate';
import Inquiries from './pages/Inquiries';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

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
    path: "/inquiries/:id",
    element: <Layout><InquiryDetail /></Layout>,
  },
  {
    path: "/inquiries/edit/:id",
    element: <Layout><InquiryEdit /></Layout>,
  },
  {
    path: "/inquiries/create",
    element: <Layout><InquiryCreate /></Layout>,
  },
  {
    path: "/admin/dashboard",
    element: <Layout><AdminDashboard /></Layout>,
  },
  {
    path: "/admin/settings",
    element: <Layout><AdminSettings /></Layout>,
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
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
