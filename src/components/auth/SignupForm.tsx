
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface SignupFormProps {
  onSubmit: (formData: {
    fullName: string;
    email: string;
    password: string;
    companyName: string;
    selectedPlan: string;
    paymentMethod: string;
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
    companyName: "",
    selectedPlan: "trial",
    paymentMethod: "card",
    agreeToTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const plans = [
    {
      id: "trial",
      name: "Free Trial",
      description: "14-day free trial with full access",
      price: "Free for 14 days",
      features: ["Up to 5 team members", "Unlimited quotes", "Basic support"]
    },
    {
      id: "basic",
      name: "Basic Plan",
      description: "Perfect for small travel agencies",
      price: "$29/month",
      features: ["Up to 10 team members", "Unlimited quotes", "Email support", "Basic analytics"]
    },
    {
      id: "pro",
      name: "Pro Plan",
      description: "Advanced features for growing businesses",
      price: "$79/month",
      features: ["Up to 25 team members", "Advanced analytics", "Priority support", "Custom branding"]
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Company Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
          <Input
            id="companyName"
            name="companyName"
            type="text"
            placeholder="Acme Travel Agency"
            value={formData.companyName}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>
      </div>

      {/* Owner Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Organization Owner Details</h3>
        
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
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
          <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@acmetravel.com"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full"
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
      </div>

      {/* Plan Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Choose Your Plan</h3>
        
        <div className="grid gap-4">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`cursor-pointer transition-all ${
                formData.selectedPlan === plan.id 
                  ? 'ring-2 ring-teal-600 border-teal-600' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleSelectChange('selectedPlan', plan.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="selectedPlan"
                      value={plan.id}
                      checked={formData.selectedPlan === plan.id}
                      onChange={() => handleSelectChange('selectedPlan', plan.id)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-600"
                    />
                    <div>
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <CardDescription className="text-sm">{plan.description}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-teal-600">{plan.price}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-gray-600 space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-teal-600 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method (only for non-trial plans) */}
      {formData.selectedPlan !== 'trial' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
          
          <Select onValueChange={(value) => handleSelectChange('paymentMethod', value)} defaultValue="card">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">Credit/Debit Card</SelectItem>
              <SelectItem value="mpesa">M-Pesa</SelectItem>
            </SelectContent>
          </Select>
          
          <p className="text-xs text-gray-500">
            {formData.selectedPlan === 'trial' 
              ? 'No payment required during trial period' 
              : 'You can update payment details after registration'
            }
          </p>
        </div>
      )}
      
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
        {loading ? "Creating Organization..." : "Create Organization & Start Trial"}
      </Button>
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          {formData.selectedPlan === 'trial' 
            ? 'Start your 14-day free trial. No credit card required.' 
            : 'Your subscription will begin immediately after registration.'
          }
        </p>
      </div>
    </form>
  );
};

export default SignupForm;
