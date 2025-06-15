
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import AuthLayout from "../components/auth/AuthLayout";

const AdminLogin = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state with updated default credentials
  const [formData, setFormData] = useState({
    email: "admin@travelflow360.com",
    password: "",
  });
  
  // Check if already logged in as admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
          
        if (data?.role === 'system_admin') {
          navigate('/admin/dashboard');
        }
      }
    };
    
    checkAdminStatus();
  }, [navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }
    
    setLoading(true);
    
    try {
      // Sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (authError) {
        toast.error(authError.message);
        setLoading(false);
        return;
      }
      
      // Check if the user has system_admin role
      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();
          
        if (profileError) {
          toast.error("Failed to verify admin credentials");
          // Sign out since not an admin
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        
        // Verify if user is admin
        if (profileData.role === 'system_admin') {
          toast.success("Admin login successful!");
          navigate("/admin/dashboard");
        } else {
          toast.error("Only system administrators can access this area");
          // Sign out since not an admin
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error("An error occurred during admin login");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout
      title="System Administrator"
      description="Restricted access. Authorized personnel only."
      footerText="This is a secure administration area. All actions are logged and monitored."
      navLink={{
        text: "Back to Regular Login",
        to: "/login"
      }}
    >
      <div className="mb-6 flex justify-center">
        <div className="w-fit p-3 bg-red-100 rounded-full">
          <ShieldAlert className="h-8 w-8 text-red-500" />
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Admin Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@travelflow360.com"
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
              className="w-full pr-10"
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
        
        <Button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Secure Sign In"}
        </Button>
        
        <div className="text-sm text-center space-y-2">
          <p className="text-gray-500">
            Default credentials: admin@travelflow360.com
          </p>
          <p className="text-gray-500">
            Password: TravelFlow360Admin2024!
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;
