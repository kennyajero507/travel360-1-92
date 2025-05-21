
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import { Globe } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        setSubmitted(true);
        toast.success("Password reset email sent. Please check your inbox.");
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Failed to send password reset email");
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
              Back to Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              {!submitted 
                ? "Enter your email address and we'll send you a link to reset your password." 
                : "Check your email for a link to reset your password."}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={loading}
                >
                  {loading ? "Sending reset link..." : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p>
                  If an account exists for <strong>{email}</strong>, you'll receive an email with a link to reset your password.
                </p>
                <p className="text-sm text-slate-500">
                  Don't see the email? Check your spam folder.
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-4">
            <div className="space-y-2 text-center">
              <p>
                <Link to="/login" className="text-teal-600 hover:underline">
                  Return to Login
                </Link>
              </p>
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link to="/signup" className="text-teal-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
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

export default ForgotPassword;
