
import React from "react";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  footerText?: string;
  footerLink?: {
    text: string;
    to: string;
  };
  navLink?: {
    text: string;
    to: string;
  };
}

const AuthLayout = ({ 
  children, 
  title, 
  description, 
  footerText, 
  footerLink,
  navLink 
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Navigation */}
      <header className="border-b py-4 w-full">
        <nav className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-teal-600" />
            <span className="text-xl font-bold text-teal-600">TravelFlow360</span>
          </Link>
          {navLink && (
            <div className="flex items-center space-x-4">
              <Link to={navLink.to} className="text-slate-600 hover:text-teal-600">
                {navLink.text}
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-slate-50 w-full">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
          {(footerText || footerLink) && (
            <CardFooter className="flex justify-center border-t pt-4">
              <p className="text-sm text-slate-500">
                {footerText}{" "}
                {footerLink && (
                  <Link to={footerLink.to} className="text-teal-600 hover:underline font-medium">
                    {footerLink.text}
                  </Link>
                )}
              </p>
            </CardFooter>
          )}
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

export default AuthLayout;
