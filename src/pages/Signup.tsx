
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Eye, EyeOff, Globe, Building } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Alert, AlertDescription } from "../components/ui/alert";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, createOrganization, session, currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createOrgStep, setCreateOrgStep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    agreeToTerms: false,
    organizationName: "",
    isOrgOwner: true, // Default to organization owner
  });

  // Redirect if already logged in
  useEffect(() => {
    if (session && !createOrgStep) {
      navigate("/dashboard");
    }
  }, [session, navigate, createOrgStep]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email || !formData.password || !formData.fullName) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Attempting signup with:", formData.email);
      const success = await signup(formData.email, formData.password, formData.fullName);
      
      if (success) {
        console.log("Signup successful, moving to organization step");
        setCreateOrgStep(true);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An unexpected error occurred during signup");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.organizationName) {
      setError("Please enter an organization name");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Creating organization:", formData.organizationName);
      const success = await createOrganization(formData.organizationName);
      
      if (success) {
        toast.success("Organization created successfully!");
        navigate("/dashboard");
      } else {
        setError("Failed to create organization. Please try again.");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      setError("An unexpected error occurred while creating the organization");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b py-4">
        <nav className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-teal-600" />
            <span className="text-xl font-bold text-teal-600">TravelFlow360</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-slate-600 hover:text-teal-600">
              Already have an account? Sign in
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {createOrgStep ? "Create Your Organization" : "Create an Account"}
            </CardTitle>
            <CardDescription>
              {createOrgStep 
                ? "Set up your travel business on TravelFlow360" 
                : "Welcome to TravelFlow360! Let's get your organization set up. Start by creating your account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {!createOrgStep ? (
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
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
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                    required
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
                    I agree to the{" "}
                    <a href="#" className="text-teal-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-teal-600 hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Continue"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCreateOrganization} className="space-y-6">
                <div className="flex justify-center mb-4">
                  <Building className="h-16 w-16 text-teal-600" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    placeholder="Acme Travel Agency"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    This will be the name of your travel business in TravelFlow360
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm">
                  <p className="font-semibold text-blue-700">Your organization benefits:</p>
                  <ul className="list-disc ml-5 mt-2 text-blue-700">
                    <li>2-week free trial automatically included</li>
                    <li>Ability to invite up to 5 team members on Starter plan</li>
                    <li>Custom dashboards and reports</li>
                    <li>Manage hotel inventory and preferred suppliers</li>
                    <li>Upgrade anytime to add more team members</li>
                  </ul>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={loading}
                >
                  {loading ? "Creating Organization..." : "Create My Organization"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-600 hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            © 2025 TravelFlow360. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
