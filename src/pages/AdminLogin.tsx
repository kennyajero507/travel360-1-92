
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldAlert, UserPlus } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import AuthLayout from "../components/auth/AuthLayout";
import { createSuperAdminAccount, SUPER_ADMIN_CREDENTIALS } from "../utils/createSuperAdmin";
import { Separator } from "../components/ui/separator";

const AdminLogin = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
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

  const handleCreateSuperAdmin = async () => {
    setCreatingAdmin(true);
    try {
      const result = await createSuperAdminAccount();
      
      if (result.success) {
        toast.success('Super admin account created successfully!');
        toast.info('You can now login with the credentials below', {
          duration: 5000,
        });
        // Auto-fill the password after successful creation
        setFormData(prev => ({
          ...prev,
          password: SUPER_ADMIN_CREDENTIALS.password
        }));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error creating super admin:', error);
      toast.error('Failed to create super admin account');
    } finally {
      setCreatingAdmin(false);
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
      </form>
      
      <div className="mt-6">
        <Separator className="my-4" />
        
        <div className="text-center space-y-3">
          <div className="text-sm text-gray-600">
            <p className="font-medium">Need to create the admin account?</p>
            <p>Click below to set up the super admin account first</p>
          </div>
          
          <Button
            onClick={handleCreateSuperAdmin}
            disabled={creatingAdmin}
            variant="outline"
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {creatingAdmin ? "Creating Admin Account..." : "Create Super Admin Account"}
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-center space-y-2 mt-4">
        <p className="text-gray-500">
          Default credentials: admin@travelflow360.com
        </p>
        <p className="text-gray-500">
          Password: TravelFlow360Admin2024!
        </p>
      </div>
    </AuthLayout>
  );
};

export default AdminLogin;
