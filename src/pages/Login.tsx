
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Globe } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, session, userProfile, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  // Get the redirect path from location state, default to app dashboard
  const from = location.state?.from?.pathname || "/app/dashboard";
  
  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && session && userProfile) {
      console.log('[Login] User is logged in with profile, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [session, userProfile, authLoading, navigate, from]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('[Login] Attempting login for:', formData.email);
      const success = await login(formData.email, formData.password);
      
      if (success) {
        console.log('[Login] Login successful');
        // Navigation will be handled by useEffect when session/profile updates
      } else {
        console.log('[Login] Login failed');
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };
  
  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // Don't render login form if user is already logged in
  if (session && userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Redirecting...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Navigation */}
      <header className="border-b py-4 w-full">
        <nav className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-teal-600" />
            <span className="text-xl font-bold text-teal-600">TravelFlow360</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/signup" className="text-slate-600 hover:text-teal-600">
              Sign Up
            </Link>
            <Link to="/admin/login" className="text-red-600 hover:text-red-700 text-sm">
              Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-slate-50 w-full">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your TravelFlow360 account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-4">
            <div className="text-center">
              <Link
                to="/reset-password"
                className="text-sm text-teal-600 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link to="/signup" className="text-teal-600 hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 w-full">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            © 2025 TravelFlow360. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
