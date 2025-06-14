
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
      navigate("/dashboard");
    }
  }, [session, profile, navigate, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <p>Loading...</p>
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
      const signupSuccess = await signup(
        formData.email, 
        formData.password, 
        formData.fullName, 
        formData.role,
        formData.companyName,
      );
      
      if (signupSuccess) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError("Registration failed. The email might already be in use.");
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
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
