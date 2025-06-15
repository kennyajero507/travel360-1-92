
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useNavigate } from "react-router-dom";

const DEMO_EMAIL = "demo@travelflow360.com";
const DEMO_PASSWORD = "Demo123!";

const Login = () => {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setFormError("Invalid credentials or error logging in.");
    }
  };

  // Demo login handler
  const handleDemoLogin = async () => {
    setFormError(null);
    const success = await login(DEMO_EMAIL, DEMO_PASSWORD);
    if (success) {
      navigate("/dashboard");
    } else {
      setFormError("Demo login failed. Is the demo account present?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Sign In to TravelFlow360</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-2 text-red-600 text-xs text-center">{error}</div>
          )}
          {formError && (
            <div className="mb-2 text-red-600 text-xs text-center">{formError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                className="w-full rounded border-gray-300 p-2"
                required
                placeholder="Your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <input
                type="password"
                className="w-full rounded border-gray-300 p-2"
                required
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="my-3 text-center text-sm text-gray-500">or</div>
          <Button
            type="button"
            variant="outline"
            className="w-full mb-2"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Try Demo Account
          </Button>
          <div className="text-xs text-center text-gray-400">
            Demo: demo@travelflow360.com / Demo123!
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
