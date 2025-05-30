
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import SignupForm from "../components/auth/SignupForm";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, session, userProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (session && userProfile) {
      if (userProfile.role === 'system_admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [session, userProfile, navigate]);
  
  const handleSignup = async (formData: {
    fullName: string;
    email: string;
    password: string;
    companyName: string;
    selectedPlan: string;
    paymentMethod: string;
    agreeToTerms: boolean;
  }) => {
    setError(null);
    
    // Validation
    if (!formData.email || !formData.password || !formData.fullName || !formData.companyName) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.email.includes('@example.com')) {
      setError("Please use a real email address, not an example email");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Starting organization owner signup process for:", formData.email);
      
      const signupSuccess = await signup(formData.email, formData.password, formData.fullName, formData.companyName);
      
      if (!signupSuccess) {
        setError("Registration failed. The email might already be in use or there was an error creating the account.");
        return;
      }
      
      console.log("Organization owner account created successfully");
      
      toast.success("Organization created successfully! You are now set up as the organization owner and can start building your team.");
      
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Organization created! Please sign in to access your organization dashboard and start managing your team.",
            email: formData.email 
          }
        });
      }, 2000);
      
    } catch (error) {
      console.error("Signup error:", error);
      setError("An unexpected error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout
      title="Create Your Organization"
      description="Set up your travel business on TravelFlow360 as the organization owner. You'll be able to invite and manage tour operators and agents after registration."
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
