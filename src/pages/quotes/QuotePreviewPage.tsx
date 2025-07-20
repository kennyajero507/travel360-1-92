import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  Send, 
  MapPin, 
  Calendar, 
  Users, 
  Hotel, 
  Plane,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

// Mock quote data for preview
const mockQuote = {
  id: '1',
  quote_id: 'QUO-2501-001',
  client_name: 'Sarah Johnson',
  client_email: 'sarah@email.com',
  destination: 'Zanzibar, Tanzania',
  travel_start: '2025-03-15',
  travel_end: '2025-03-22',
  number_of_guests: 2,
  total_price: 3680,
  currency: 'USD',
  status: 'pending',
  valid_until: '2025-02-15',
  hotels: [
    {
      hotel_name: 'Zanzibar Beach Resort',
      hotel_category: '4-star',
      location: 'Stone Town',
      check_in: '2025-03-15',
      check_out: '2025-03-22',
      nights: 7,
      room_type: 'Ocean View Suite',
      meal_plan: 'Half Board',
      amenities: ['Ocean View', 'Private Balcony', 'Air Conditioning', 'Mini Bar', 'WiFi'],
      images: [
        'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
        'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'
      ]
    }
  ],
  transport: [
    {
      transport_type: 'Airport Transfer',
      route: 'Airport - Hotel - Airport',
      description: 'Private vehicle transfer with professional driver'
    },
    {
      transport_type: 'Flight',
      route: 'Nairobi - Zanzibar - Nairobi',
      description: 'Round trip flights with Kenya Airways'
    }
  ],
  inclusions: [
    '7 nights accommodation at Zanzibar Beach Resort',
    'Half Board meals (Breakfast & Dinner)',
    'Airport transfers in Zanzibar',
    'Round trip flights Nairobi - Zanzibar',
    '24/7 local support',
    'Travel insurance'
  ],
  exclusions: [
    'Visa fees',
    'Personal expenses',
    'Lunch meals',
    'Optional activities',
    'Tips and gratuities',
    'International flights to Nairobi'
  ]
};

const QuotePreviewPage = () => {
  const { id } = useParams();
  const quote = mockQuote; // In real app, fetch based on id

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isValidQuote = new Date(quote.valid_until) > new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/quotes">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quotes
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Travel Quote Preview</h1>
                <p className="text-gray-600">Client-facing quote presentation</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Send to Client
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Quote Header */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Your Dream Trip to {quote.destination}
                </h1>
                <p className="text-lg text-gray-600">
                  Personalized travel quote for {quote.client_name}
                </p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Badge className={isValidQuote ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {isValidQuote ? 'Valid Quote' : 'Expired'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Quote ID: {quote.quote_id}
                  </span>
                </div>
              </div>

              {/* Trip Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Destination</h3>
                  <p className="text-gray-600">{quote.destination}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Duration</h3>
                  <p className="text-gray-600">
                    {Math.ceil((new Date(quote.travel_end).getTime() - new Date(quote.travel_start).getTime()) / (1000 * 60 * 60 * 24))} Days
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Travelers</h3>
                  <p className="text-gray-600">{quote.number_of_guests} Guests</p>
                </div>
              </div>

              {/* Travel Dates */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Travel Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Departure</p>
                    <p className="font-medium text-gray-900">{formatDate(quote.travel_start)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Return</p>
                    <p className="font-medium text-gray-900">{formatDate(quote.travel_end)}</p>
                  </div>
                </div>
              </div>

              {/* Price Display */}
              <div className="text-center bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-2">Total Package Price</h2>
                <div className="text-4xl font-bold mb-2">
                  {formatCurrency(quote.total_price, quote.currency)}
                </div>
                <p className="text-teal-100">
                  {formatCurrency(quote.total_price / quote.number_of_guests, quote.currency)} per person
                </p>
                {isValidQuote && (
                  <p className="text-sm text-teal-100 mt-4">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Valid until {new Date(quote.valid_until).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hotels Section */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-6 w-6 text-blue-600" />
                Accommodation
              </CardTitle>
              <CardDescription>
                Carefully selected hotels for your comfort and enjoyment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quote.hotels.map((hotel, index) => (
                <div key={index} className="border rounded-lg p-6 mb-4 last:mb-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{hotel.hotel_name}</h3>
                        <div className="flex items-center">
                          {[...Array(parseInt(hotel.hotel_category.charAt(0)))].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {hotel.location}
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">Room Type</h4>
                          <p className="text-gray-600">{hotel.room_type}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Meal Plan</h4>
                          <p className="text-gray-600">{hotel.meal_plan}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Duration</h4>
                          <p className="text-gray-600">{hotel.nights} nights</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {hotel.amenities.map((amenity, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {hotel.images.map((image, i) => (
                        <img
                          key={i}
                          src={image}
                          alt={`${hotel.hotel_name} ${i + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Transport Section */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-6 w-6 text-blue-600" />
                Transportation
              </CardTitle>
              <CardDescription>
                All your transportation needs covered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.transport.map((transport, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Plane className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{transport.transport_type}</h4>
                      <p className="text-gray-600">{transport.route}</p>
                      <p className="text-sm text-gray-500 mt-1">{transport.description}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-700">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {quote.inclusions.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-red-700">Not Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {quote.exclusions.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-5 w-5 border-2 border-red-300 rounded-full mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          {isValidQuote && (
            <Card className="bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Book Your Adventure?</h2>
                <p className="text-teal-100 mb-6">
                  This quote is valid until {new Date(quote.valid_until).toLocaleDateString()}. 
                  Contact us to secure your booking or if you have any questions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                    Accept Quote & Book Now
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600">
                    Request Modifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Questions? We're Here to Help!</h3>
              <p className="text-gray-600 mb-4">
                Our travel experts are available 24/7 to assist you with your booking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <span>📧 travel@travelflow360.com</span>
                <span>📞 +1 (555) 123-4567</span>
                <span>💬 Live Chat Available</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuotePreviewPage;