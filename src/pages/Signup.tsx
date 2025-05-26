
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import SignupForm from "../components/auth/SignupForm";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, createOrganization, session, userProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in based on role
  useEffect(() => {
    if (session && userProfile) {
      // Role-based redirect
      switch (userProfile.role) {
        case 'system_admin':
          navigate("/admin/dashboard");
          break;
        case 'org_owner':
          navigate("/dashboard");
          break;
        case 'tour_operator':
          navigate("/dashboard");
          break;
        case 'agent':
          navigate("/dashboard");
          break;
        default:
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Don't allow example emails
    if (formData.email.includes('@example.com')) {
      setError("Please use a real email address, not an example email");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Starting signup process for:", formData.email);
      
      // Step 1: Create user account
      const signupSuccess = await signup(formData.email, formData.password, formData.fullName);
      
      if (!signupSuccess) {
        setError("Registration failed. The email might already be in use or there was an error creating the account.");
        return;
      }
      
      console.log("User account created successfully");
      
      // Show success message and redirect to login
      toast.success("Account created successfully! You can now sign in with your credentials.");
      
      // Add a small delay before redirect to ensure user sees the success message
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Account created! Please sign in with your new credentials.",
            email: formData.email 
          }
        });
      }, 1500);
      
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
      description="Set up your travel business on TravelFlow360 and start managing quotes, team members, and client relationships."
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
