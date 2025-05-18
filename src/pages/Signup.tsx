
import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Globe, CreditCard, Phone } from "lucide-react";
import { useRole } from "../contexts/RoleContext";

const Signup = () => {
  const navigate = useNavigate();
  const { setRole, setTier, setCurrentUser, setOrganization } = useRole();
  
  const [activeTab, setActiveTab] = useState<string>("starter");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mpesa">("card");
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    organizationName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.organizationName || !formData.phone || !formData.password) {
      toast.error("Please fill in all fields");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    
    return true;
  };
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      // Set user role, tier, and user info in context
      setRole("org_owner");
      setTier(activeTab as "starter" | "pro" | "enterprise");
      
      const userId = `user-${Math.random().toString(36).substr(2, 9)}`;
      const orgId = `org-${Math.random().toString(36).substr(2, 9)}`;
      
      setCurrentUser({
        id: userId,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        organizationId: orgId
      });
      
      setOrganization({
        id: orgId,
        name: formData.organizationName,
        ownerId: userId,
        tier: activeTab as "starter" | "pro" | "enterprise",
        memberCount: 1,
        createdAt: new Date().toISOString()
      });
      
      toast.success("Account created successfully!");
      
      // Redirect to dashboard
      navigate("/");
    }, 2000);
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
              Already have an account? Log in
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-slate-50">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Create Your TravelFlow360 Account</h1>
            <p className="text-slate-600 mt-2">Streamline your travel business today</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Enter your details to create an account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
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
                        <Label htmlFor="organizationName">Organization Name</Label>
                        <Input
                          id="organizationName"
                          name="organizationName"
                          placeholder="Acme Travel Ltd."
                          value={formData.organizationName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="+254 7XX XXX XXX"
                          value={formData.phone}
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
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium text-lg mb-4">Payment Method</h3>
                      <div className="flex gap-4">
                        <div
                          className={`flex-1 border rounded-lg p-4 cursor-pointer ${
                            paymentMethod === "card" ? "border-teal-500 bg-teal-50" : "border-gray-200"
                          }`}
                          onClick={() => setPaymentMethod("card")}
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-teal-600" />
                            <span className="font-medium">Card Payment</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-2">
                            Pay securely with your credit or debit card
                          </p>
                        </div>
                        <div
                          className={`flex-1 border rounded-lg p-4 cursor-pointer ${
                            paymentMethod === "mpesa" ? "border-teal-500 bg-teal-50" : "border-gray-200"
                          }`}
                          onClick={() => setPaymentMethod("mpesa")}
                        >
                          <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-teal-600" />
                            <span className="font-medium">M-Pesa</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-2">
                            Pay using M-Pesa mobile money service
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      disabled={loading}
                    >
                      {loading ? "Creating Account..." : "Create Account & Subscribe"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 border-t pt-4">
                  <p className="text-sm text-slate-500 text-center">
                    By creating an account, you agree to our{" "}
                    <a href="#" className="text-teal-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-teal-600 hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </CardFooter>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Plan</CardTitle>
                  <CardDescription>
                    Choose the best plan for your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="starter" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="starter">Starter</TabsTrigger>
                      <TabsTrigger value="pro">Pro</TabsTrigger>
                    </TabsList>
                    <TabsContent value="starter">
                      <PlanDetails
                        tier="Starter"
                        price="29"
                        features={[
                          "1 Organization",
                          "Up to 2 Agents",
                          "50 Quotes per Month",
                          "Basic Hotel Database",
                          "Email & WhatsApp Sharing",
                          "Standard Support"
                        ]}
                      />
                    </TabsContent>
                    <TabsContent value="pro">
                      <PlanDetails
                        tier="Pro"
                        price="99"
                        features={[
                          "1 Organization",
                          "Up to 10 Agents",
                          "Unlimited Quotes",
                          "Advanced Hotel Database",
                          "PDF Export & Branding",
                          "Premium Support",
                          "Advanced Analytics"
                        ]}
                      />
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-6 text-center">
                    <Link to="/contact-sales" className="text-teal-600 hover:underline text-sm">
                      Need Enterprise features? Contact our sales team
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
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

const PlanDetails = ({ 
  tier, 
  price, 
  features 
}: { 
  tier: string, 
  price: string, 
  features: string[] 
}) => (
  <div className="space-y-6">
    <div className="text-center p-4 bg-slate-50 rounded-lg">
      <h3 className="text-lg font-medium mb-2">{tier}</h3>
      <div className="flex items-center justify-center">
        <span className="text-3xl font-bold">${price}</span>
        <span className="text-slate-600 ml-1">/month</span>
      </div>
    </div>
    
    <div className="space-y-2">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-teal-500 mr-2"></div>
          <span className="text-sm">{feature}</span>
        </div>
      ))}
    </div>
  </div>
);

export default Signup;
