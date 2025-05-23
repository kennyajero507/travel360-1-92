
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import SignupForm from "../components/auth/SignupForm";
import OrganizationForm from "../components/auth/OrganizationForm";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, createOrganization, session } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [createOrgStep, setCreateOrgStep] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (session && !createOrgStep) {
      navigate("/dashboard");
    }
  }, [session, navigate, createOrgStep]);
  
  const handleSignup = async (formData: {
    fullName: string;
    email: string;
    password: string;
    agreeToTerms: boolean;
  }) => {
    setError(null);
    
    if (!formData.email || !formData.password || !formData.fullName) {
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
    
    setLoading(true);
    
    try {
      console.log("Attempting signup with:", formData.email);
      const success = await signup(formData.email, formData.password, formData.fullName);
      
      if (success) {
        console.log("Signup successful, moving to organization step");
        setCreateOrgStep(true);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An unexpected error occurred during signup");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateOrganization = async (organizationName: string) => {
    setError(null);
    
    if (!organizationName) {
      setError("Please enter an organization name");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Creating organization:", organizationName);
      const success = await createOrganization(organizationName);
      
      if (success) {
        toast.success("Organization created successfully!");
        navigate("/dashboard");
      } else {
        setError("Failed to create organization. Please try again.");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      setError("An unexpected error occurred while creating the organization");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout
      title={createOrgStep ? "Create Your Organization" : "Create an Account"}
      description={
        createOrgStep 
          ? "Set up your travel business on TravelFlow360" 
          : "Start your journey with TravelFlow360 by creating your organization. Once registered, you'll be able to invite tour operators and agents."
      }
      footerText="Already have an account?"
      footerLink={{ text: "Sign In", to: "/login" }}
      navLink={{ text: "Already have an account? Sign in", to: "/login" }}
    >
      {!createOrgStep ? (
        <SignupForm
          onSubmit={handleSignup}
          loading={loading}
          error={error}
        />
      ) : (
        <OrganizationForm
          onSubmit={handleCreateOrganization}
          loading={loading}
          error={error}
        />
      )}
    </AuthLayout>
  );
};

export default Signup;
