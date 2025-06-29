
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useSimpleAuth } from "../contexts/SimpleAuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const SimpleSignup = () => {
  const navigate = useNavigate();
  const { signUp, session, profile, loading: authLoading } = useSimpleAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    role: 'org_owner' as 'org_owner' | 'tour_operator',
  });
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && session && profile) {
      console.log('[SimpleSignup] User already authenticated, redirecting to dashboard');
      navigate("/dashboard");
    }
  }, [session, profile, navigate, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleRoleChange = (value: 'org_owner' | 'tour_operator') => {
    setFormData(prev => ({ ...prev, role: value }));
    if (error) setError(null);
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.fullName.trim()) {
      errors.push("Full name is required");
    }
    
    if (!formData.email.trim()) {
      errors.push("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }
    
    if (!formData.password) {
      errors.push("Password is required");
    } else if (formData.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }
    
    if (formData.role === 'org_owner' && !formData.companyName.trim()) {
      errors.push("Company name is required for organization owners");
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('[SimpleSignup] Starting signup process for:', formData.email);
      
      const success = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role,
        formData.companyName
      );
      
      if (success) {
        console.log('[SimpleSignup] Signup successful');
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Account created successfully! Please check your email to verify your account.</span>
          </div>
        );
        
        // Brief delay before redirect
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError("Registration failed. Please check your details and try again.");
      }
    } catch (err: any) {
      console.error('[SimpleSignup] Signup error:', err);
      setError(err.message || "An unexpected error occurred during registration.");
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
          <CardTitle className="text-2xl font-bold text-slate-800">Create Your Account</CardTitle>
          <p className="text-slate-600">Join TravelFlow360 to streamline your travel business</p>
        </CardHeader>
        <CardContent>
          {(error || validationErrors.length > 0) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  {error && <p className="text-sm text-red-700 mb-1">{error}</p>}
                  {validationErrors.length > 0 && (
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((err, idx) => (
                        <li key={idx} className="text-xs text-red-700">{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org_owner">
                    <div className="py-1">
                      <div className="font-medium">Business Owner</div>
                      <div className="text-xs text-gray-500">Create and manage your travel business</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="tour_operator">
                    <div className="py-1">
                      <div className="font-medium">Travel Agent</div>
                      <div className="text-xs text-gray-500">Join an existing travel business</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'org_owner' && (
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Acme Travel Agency"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  disabled={loading}
                  required={formData.role === 'org_owner'}
                />
                <p className="text-xs text-blue-600">
                  Your company will get a 14-day free trial with up to 5 team members
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@acmetravel.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  minLength={6}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleSignup;
