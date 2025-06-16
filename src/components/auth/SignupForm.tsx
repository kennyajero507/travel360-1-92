
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription } from "../ui/card";

interface SignupFormProps {
  onSubmit: (formData: {
    fullName: string;
    email: string;
    password: string;
    companyName?: string;
    role: 'org_owner' | 'tour_operator';
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SignupForm = ({ onSubmit, loading, error }: SignupFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    role: 'org_owner' as 'org_owner' | 'tour_operator',
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };
  
  const handleRoleChange = (value: 'org_owner' | 'tour_operator') => {
    setFormData(prev => ({ ...prev, role: value }));
    // Clear validation errors when role changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
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
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Signup form submission error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || validationErrors.length > 0) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error && <div className="mb-2">{error}</div>}
            {validationErrors.length > 0 && (
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx} className="text-sm">{err}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="role">Account Type</Label>
        <Select value={formData.role} onValueChange={handleRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="org_owner">
              <div>
                <div className="font-medium">Business Owner</div>
                <div className="text-xs text-gray-500">Create and manage your travel business</div>
              </div>
            </SelectItem>
            <SelectItem value="tour_operator">
              <div>
                <div className="font-medium">Travel Agent</div>
                <div className="text-xs text-gray-500">Join an existing travel business</div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.role === 'org_owner' && (
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
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
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-3">
              <CardDescription className="text-xs">
                Your company will get a 14-day free trial with up to 5 team members
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
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
        <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
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
        <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
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
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Password must be at least 6 characters
        </p>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-700"
        disabled={loading}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
      
      <div className="text-xs text-gray-500 text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy
      </div>
    </form>
  );
};

export default SignupForm;
