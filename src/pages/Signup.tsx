
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import SignupForm from "../components/auth/SignupForm";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, session, profile, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && session && profile) {
      console.log('[Signup] User already authenticated, redirecting to dashboard');
      navigate("/dashboard");
    }
  }, [session, profile, navigate, authLoading]);

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
  
  const handleSignup = async (formData: {
    fullName: string;
    email: string;
    password: string;
    companyName?: string;
    role: 'org_owner' | 'tour_operator';
  }) => {
    setError(null);
    setLoading(true);
    
    try {
      console.log('[Signup] Starting signup process with data:', {
        email: formData.email,
        role: formData.role,
        hasCompanyName: !!formData.companyName
      });

      const signupSuccess = await signup(
        formData.email, 
        formData.password, 
        formData.fullName, 
        formData.role,
        formData.companyName,
      );
      
      if (signupSuccess) {
        console.log('[Signup] Signup successful');
        toast.success('Account created successfully! Please check your email to verify your account before signing in.');
        
        // Brief delay before redirect to show the success message
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        console.error('[Signup] Signup failed');
        setError("Registration failed. Please check your details and try again.");
      }
    } catch (error: any) {
      console.error('[Signup] Error during signup:', error);
      setError(error.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout
      title="Create Your Account"
      description="Join TravelFlow360 to streamline your travel business operations."
      footerText="Already have an account?"
      footerLink={{ text: "Sign In", to: "/login" }}
      navLink={{ text: "Already have an account? Sign in", to: "/login" }}
    >
      <SignupForm
        onSubmit={handleSignup}
        loading={loading}
        error={error}
      />
    </AuthLayout>
  );
};

export default Signup;
