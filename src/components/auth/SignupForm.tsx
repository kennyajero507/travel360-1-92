
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface SignupFormProps {
  onSubmit: (formData: {
    fullName: string;
    email: string;
    password: string;
    agreeToTerms: boolean;
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
    agreeToTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
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
          className="w-full"
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
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
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
  );
};

export default SignupForm;
