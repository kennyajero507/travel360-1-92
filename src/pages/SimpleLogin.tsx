
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useSimpleAuth } from "../contexts/SimpleAuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const SimpleLogin = () => {
  const navigate = useNavigate();
  const { signIn, session, profile, loading: authLoading } = useSimpleAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && session && profile) {
      console.log('[SimpleLogin] User already authenticated, redirecting to dashboard');
      navigate("/dashboard");
    }
  }, [session, profile, navigate, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('[SimpleLogin] Starting login process for:', formData.email);
      
      const success = await signIn(formData.email, formData.password);
      
      if (success) {
        console.log('[SimpleLogin] Login successful');
        toast.success('Successfully signed in!');
        navigate("/dashboard");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error('[SimpleLogin] Login error:', err);
      setError(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-800">Welcome Back</CardTitle>
          <p className="text-slate-600">Sign in to your TravelFlow360 account</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
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
                  disabled={loading}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
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
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Link to="/admin/login" className="text-xs text-slate-500 hover:text-slate-700">
              Admin Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleLogin;
