
import React from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Navigation />
      
      <section className="w-full py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-8 tracking-tight">
            About TravelFlow360
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-6 font-light">
              TravelFlow360 is the leading travel business management platform, designed specifically 
              for travel agencies, tour operators, and travel professionals worldwide.
            </p>
            <p className="text-gray-600 mb-6">
              Founded with the vision of simplifying travel quotations and streamlining operations, 
              we help travel businesses save time, increase conversion rates, and deliver exceptional 
              customer experiences.
            </p>
            <p className="text-gray-600">
              Our platform combines powerful technology with industry expertise to provide 
              comprehensive solutions for quote management, team collaboration, and business growth.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
