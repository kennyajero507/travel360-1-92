
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const Login = () => {
  const { login, loading, error, session, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (session && profile) {
      console.log('[Login] User already authenticated, redirecting');
      navigate("/dashboard");
    }
  }, [session, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!email || !password) {
      setFormError("Please enter both email and password");
      return;
    }
    
    console.log('[Login] Starting login process for:', email);
    
    const success = await login(email, password);
    if (success) {
      console.log('[Login] Login successful, navigating to dashboard');
      navigate("/dashboard");
    } else {
      console.error('[Login] Login failed');
      setFormError("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your TravelFlow360 account"
      footerText="Don't have an account?"
      footerLink={{
        text: "Sign up here",
        to: "/signup"
      }}
      navLink={{
        text: "Admin Login",
        to: "/admin/login"
      }}
    >
      {/* Enhanced error display */}
      {(error || formError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">
                Sign In Error
              </h3>
              <p className="text-sm text-red-700">
                {error || formError}
              </p>
              {error?.includes('Profile') && (
                <p className="text-xs text-red-600 mt-2">
                  If this problem persists, try refreshing the page or contact support.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
    </AuthLayout>
  );
};

export default Login;
