
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Alert, AlertDescription } from "../components/ui/alert";
import AuthLayout from "../components/auth/AuthLayout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, session, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const from = location.state?.from?.pathname || null;
  const successMessage = location.state?.message || null;
  const prefilledEmail = location.state?.email || "";
  const invitationToken = searchParams.get('invitation');

  // Pre-fill email if provided from signup
  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  // Show success message from signup if present
  useEffect(() => {
    if (successMessage) {
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [successMessage]);

  // Redirect if already logged in
  useEffect(() => {
    if (session && userProfile) {
      // If there's an invitation token, redirect to accept invitation page
      if (invitationToken) {
        navigate(`/invite?token=${invitationToken}`, { replace: true });
        return;
      }
      
      const destination = from || (userProfile.role === 'system_admin' ? '/admin/dashboard' : '/dashboard');
      console.log("Redirecting to:", destination);
      navigate(destination, { replace: true });
    }
  }, [session, userProfile, navigate, from, invitationToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Starting login process...");
      const success = await login(email, password);
      
      if (success) {
        console.log("Login successful, waiting for redirect...");
        // The useEffect above will handle the redirect once userProfile is loaded
      } else {
        setError("Invalid email or password. Please check your credentials and try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your TravelFlow360 account"
      footerText="Don't have an account?"
      footerLink={{ text: "Sign Up", to: "/signup" }}
      navLink={{ text: "Need an account? Sign up", to: "/signup" }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {invitationToken && (
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              You have an invitation to join an organization. Please log in to accept it.
            </AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
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
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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
        
        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-teal-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        
        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Login;
