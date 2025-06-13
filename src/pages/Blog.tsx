
import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/landing/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "10 Tips for Creating Compelling Travel Quotes",
      excerpt: "Learn how to create quotes that convert prospects into bookings with these proven strategies.",
      author: "Sarah Johnson",
      date: "March 15, 2025",
      category: "Sales",
      readTime: "5 min read",
      image: "/lovable-uploads/8827d443-a68b-4bd9-998f-3c4c410510e9.png"
    },
    {
      id: 2,
      title: "The Future of Travel Technology in 2025",
      excerpt: "Exploring emerging technologies that are reshaping the travel industry landscape.",
      author: "Mike Chen",
      date: "March 12, 2025",
      category: "Technology",
      readTime: "8 min read",
      image: "/lovable-uploads/739ab3ed-442e-42fb-9219-25ee697b73ba.png"
    },
    {
      id: 3,
      title: "Managing Client Expectations in Uncertain Times",
      excerpt: "Best practices for maintaining client relationships when travel plans change.",
      author: "Emma Davis",
      date: "March 10, 2025",
      category: "Client Relations",
      readTime: "6 min read",
      image: "/lovable-uploads/92333427-5a32-4cf8-b110-afc5b57c9f27.png"
    },
    {
      id: 4,
      title: "Streamlining Your Booking Process",
      excerpt: "How to reduce manual work and improve efficiency in your travel agency operations.",
      author: "David Wilson",
      date: "March 8, 2025",
      category: "Operations",
      readTime: "7 min read",
      image: "/lovable-uploads/407e5ec8-9b67-42ee-acf0-b238e194aa64.png"
    }
  ];

  const categories = ["All", "Sales", "Technology", "Client Relations", "Operations", "Marketing"];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Travel Industry Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest trends, tips, and strategies for travel professionals.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        <Card className="mb-16 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src={blogPosts[0].image} 
                alt={blogPosts[0].title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <Badge className="mb-4">{blogPosts[0].category}</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {blogPosts[0].title}
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                {blogPosts[0].excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{blogPosts[0].author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{blogPosts[0].date}</span>
                  </div>
                  <span>{blogPosts[0].readTime}</span>
                </div>
                <Button>
                  Read More <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                </div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {post.excerpt}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-teal-50 rounded-2xl p-12 text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Get the latest travel industry insights, tips, and updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Button className="bg-teal-600 hover:bg-teal-700 px-8">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
