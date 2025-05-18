
import React from 'react';
import { useNavigate } from 'react-router-dom';
import VerticalNav from '../components/VerticalNav';
import { Button } from '../components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">TravelFlow360</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-6">The Ultimate Travel Agency Management Platform</h2>
          <p className="text-lg text-gray-600 mb-8">
            Streamline your travel agency operations, manage bookings, and delight your clients with a seamless travel planning experience.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 my-20">
          {/* Feature Cards */}
          <FeatureCard 
            title="Quote Management" 
            description="Create, manage and share beautiful quotes with your clients in minutes."
            icon="💼"
          />
          <FeatureCard 
            title="Hotel Database" 
            description="Access our extensive database of hotels and accommodations worldwide."
            icon="🏨"
          />
          <FeatureCard 
            title="Client Management" 
            description="Keep track of all your clients and their travel preferences."
            icon="👥"
          />
        </div>
      </main>
      
      <footer className="bg-gray-50 border-t py-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2023 TravelFlow360. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, description, icon }: { title: string, description: string, icon: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Index;
