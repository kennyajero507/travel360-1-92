
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
import { Eye, EyeOff, Globe, ShieldAlert } from "lucide-react";
import { supabase } from "../integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
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
        
        // Verify if user is admin (removed 2FA check for development)
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
    <div className="min-h-screen flex flex-col w-full">
      {/* Navigation */}
      <header className="border-b py-4 w-full">
        <nav className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-teal-600" />
            <span className="text-xl font-bold text-teal-600">TravelFlow360</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-slate-600 hover:text-teal-600">
              Back to Regular Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-slate-50 w-full">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-fit mb-2">
              <ShieldAlert className="h-10 w-10 text-red-500" />
            </div>
            <CardTitle className="text-2xl">System Administrator</CardTitle>
            <CardDescription className="text-red-500">
              Restricted access. Authorized personnel only.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              </div>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Secure Sign In"}
              </Button>
              <p className="text-sm text-center text-gray-500">
                Development mode: 2FA validation disabled
              </p>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t pt-4">
            <p className="text-xs text-slate-500 text-center">
              This is a secure administration area. All actions are logged and monitored.
            </p>
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 w-full">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            © 2025 TravelFlow360. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLogin;
