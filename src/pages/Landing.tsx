
import React from "react";
import HeroSection from "../components/landing/HeroSection";
import Navigation from "../components/landing/Navigation";
import Footer from "../components/landing/Footer";
import { ContactSection } from "../components/landing/ContactSection";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Landing;
