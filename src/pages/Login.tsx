
import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Alert, AlertDescription } from "../components/ui/alert";
import AuthLayout from "../components/auth/AuthLayout";
import { getRedirectPath } from "../utils/authValidation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, session, userProfile, loading: authLoading, authError } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const invitationToken = searchParams.get('invitation');

  // Handle redirect when user is authenticated and profile is loaded
  useEffect(() => {
    console.log('[Login] Auth state:', { 
      authLoading, 
      session: !!session, 
      userProfile: !!userProfile,
      invitationToken 
    });

    if (!authLoading && session && userProfile) {
      // Don't redirect if there's an invitation to process
      if (invitationToken) {
        console.log('[Login] Has invitation token, staying on login page');
        return;
      }
      
      // Use the new redirect utility
      const redirectPath = getRedirectPath(userProfile);
      console.log(`[Login] Redirecting ${userProfile.role} to ${redirectPath}`);
      
      setTimeout(() => {
        navigate(redirectPath);
      }, 500);
    }
  }, [session, userProfile, invitationToken, authLoading, navigate]);

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
      const success = await login(email, password);
      
      if (!success) {
        setError("Login failed. Please check your credentials and try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(false);
  };

  // Show loading state during auth check
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

  // Show redirecting state
  if (session && userProfile && !invitationToken) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show profile loading state for authenticated users
  if (session && !userProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600 mb-4">Loading your profile...</p>
          {authError && (
            <Alert variant="destructive" className="mt-4 max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="text-sm mt-4"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const displayError = error || authError;

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
        
        {displayError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{displayError}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </AlertDescription>
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
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
