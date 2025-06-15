
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";

const DashboardPage = () => {
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="rounded-xl shadow-xl bg-white/70 px-8 py-10 max-w-lg text-center">
        <h1 className="font-bold text-3xl mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Welcome to Your App
        </h1>
        <p className="mb-4 text-gray-600">
          {profile?.full_name
            ? `Hello, ${profile.full_name}!`
            : "You’re signed in and ready to go."}
        </p>
        <p className="mb-6 text-gray-500 text-sm">
          This is your clean dashboard start. We'll build features step by step.
        </p>
        <Button className="w-full" onClick={logout}>
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
