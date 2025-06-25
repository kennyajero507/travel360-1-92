
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthDebugger from "../components/auth/AuthDebugger";
import { Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

const Login = () => {
  const { login, loading, error, session, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDebugger, setShowDebugger] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in and has profile
  React.useEffect(() => {
    if (session && profile) {
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
    
    console.log('[Login] Attempting login with:', email);
    const success = await login(email, password);
    
    if (success) {
      console.log('[Login] Login successful, waiting for profile...');
      // Navigation will happen automatically via useEffect above
    } else {
      setFormError(error || "Login failed. Please check your credentials.");
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
      {(error || formError) && (
        <Alert variant="destructive" className="mb-4">
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
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      
      {/* Debug section - only show in development or when there are persistent issues */}
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
