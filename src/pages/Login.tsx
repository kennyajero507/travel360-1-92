
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthDebugger from "../components/auth/AuthDebugger";
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardContent } from "../components/ui/card";

const Login = () => {
  const { login, loading, error, session, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDebugger, setShowDebugger] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in and has profile
  React.useEffect(() => {
    if (session && profile) {
      console.log('[Login] User already authenticated, redirecting to dashboard');
      navigate("/dashboard");
    }
  }, [session, profile, navigate]);

  // Form validation
  const validateForm = () => {
    if (!email.trim()) {
      setFormError("Email is required");
      return false;
    }
    
    if (!email.includes('@')) {
      setFormError("Please enter a valid email address");
      return false;
    }
    
    if (!password) {
      setFormError("Password is required");
      return false;
    }
    
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    console.log('[Login] Attempting login with:', email);
    
    try {
      const success = await login(email.trim().toLowerCase(), password);
      
      if (success) {
        console.log('[Login] Login successful, waiting for profile...');
        // Show success state briefly before redirect
        setTimeout(() => {
          // Navigation will happen automatically via useEffect above
        }, 500);
      } else {
        setFormError(error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error('[Login] Unexpected error:', err);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success state when login is successful but waiting for redirect
  if (session && !profile && !loading) {
    return (
      <AuthLayout
        title="Welcome Back"
        description="Setting up your workspace..."
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Login Successful!</h3>
                <p className="text-sm text-gray-600">Setting up your workspace...</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '85%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

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
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {formError || error}
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formError) setFormError(null); // Clear error on input
            }}
            disabled={loading || isSubmitting}
            required
            className="w-full"
            autoComplete="email"
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
              onChange={(e) => {
                setPassword(e.target.value);
                if (formError) setFormError(null); // Clear error on input
              }}
              disabled={loading || isSubmitting}
              required
              className="w-full pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={loading || isSubmitting}
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
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
          disabled={loading || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
      
      {/* Connection status indicator */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{navigator.onLine ? 'Connected' : 'Offline'}</span>
        </div>
      </div>
      
      {/* Debug section */}
      <div className="mt-8 pt-8 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDebugger(!showDebugger)}
          className="text-xs text-gray-500"
        >
          {showDebugger ? 'Hide' : 'Show'} Debug Info
        </Button>
        
        {showDebugger && (
          <div className="mt-4">
            <AuthDebugger />
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default Login;
