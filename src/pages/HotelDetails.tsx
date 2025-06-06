import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { MapPin, Phone, Mail, Star, Wifi, Car, Coffee, UtensilsCrossed, Waves, Building2, Edit, ArrowLeft } from "lucide-react";
import { useHotelsData } from "../hooks/useHotelsData";

const HotelDetails = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const { hotels } = useHotelsData();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hotelId && hotels.length > 0) {
      const foundHotel = hotels.find(h => h.id === hotelId);
      setHotel(foundHotel);
      setLoading(false);
    }
  }, [hotelId, hotels]);

  const getIconForAmenity = (amenity: string) => {
    const icons: Record<string, any> = {
      'wifi': Wifi,
      'parking': Car,
      'restaurant': UtensilsCrossed,
      'pool': Waves,
      'gym': Building2,
      'spa': Star,
      'breakfast': Coffee
    };
    return icons[amenity.toLowerCase()] || Star;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Hotel Not Found</h2>
        <p className="text-gray-600 mb-6">The hotel you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/hotels")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hotels
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <p className="text-gray-600">{hotel.destination}</p>
            <Badge variant="secondary">{hotel.category}</Badge>
            <Badge variant={hotel.status === 'Active' ? 'default' : 'secondary'}>
              {hotel.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/edit-hotel/${hotel.id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Hotel
          </Button>
          <Button variant="outline" onClick={() => navigate("/hotels")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hotels
          </Button>
        </div>
      </div>

      {/* Additional Details Section */}
      {hotel.additional_details && (
        <div className="space-y-6">
          {/* Star Rating */}
          {hotel.additional_details.starRating && (
            <Card>
              <CardHeader>
                <CardTitle>Star Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1">
                  {Array.from({ length: hotel.additional_details.starRating }, (_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-gray-600">{hotel.additional_details.starRating} Star Hotel</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Check-in/Check-out Times */}
          {(hotel.additional_details.checkInTime || hotel.additional_details.checkOutTime) && (
            <Card>
              <CardHeader>
                <CardTitle>Check-in/Check-out</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotel.additional_details.checkInTime && (
                    <div>
                      <h4 className="font-medium text-gray-700">Check-in Time</h4>
                      <p>{hotel.additional_details.checkInTime}</p>
                    </div>
                  )}
                  {hotel.additional_details.checkOutTime && (
                    <div>
                      <h4 className="font-medium text-gray-700">Check-out Time</h4>
                      <p>{hotel.additional_details.checkOutTime}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Type */}
          {hotel.additional_details.propertyType && (
            <Card>
              <CardHeader>
                <CardTitle>Property Type</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{hotel.additional_details.propertyType}</p>
              </CardContent>
            </Card>
          )}

          {/* Year Built/Renovated */}
          {(hotel.additional_details.yearBuilt || hotel.additional_details.yearRenovated) && (
            <Card>
              <CardHeader>
                <CardTitle>Property History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotel.additional_details.yearBuilt && (
                    <div>
                      <h4 className="font-medium text-gray-700">Year Built</h4>
                      <p>{hotel.additional_details.yearBuilt}</p>
                    </div>
                  )}
                  {hotel.additional_details.yearRenovated && (
                    <div>
                      <h4 className="font-medium text-gray-700">Year Renovated</h4>
                      <p>{hotel.additional_details.yearRenovated}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Languages Spoken */}
          {hotel.additional_details.languagesSpoken && Array.isArray(hotel.additional_details.languagesSpoken) && hotel.additional_details.languagesSpoken.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Languages Spoken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {hotel.additional_details.languagesSpoken.map((language: string, index: number) => (
                    <Badge key={index} variant="outline">{language}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Awards and Certifications */}
          {hotel.additional_details.awards && Array.isArray(hotel.additional_details.awards) && hotel.additional_details.awards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Awards & Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {hotel.additional_details.awards.map((award: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {award}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Description */}
      {hotel.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      {hotel.contact_info && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hotel.contact_info.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{hotel.contact_info.phone}</span>
              </div>
            )}
            {hotel.contact_info.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{hotel.contact_info.email}</span>
              </div>
            )}
            {hotel.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <span>{hotel.address}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Amenities */}
      {hotel.amenities && Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {hotel.amenities.map((amenity: string, index: number) => {
                const IconComponent = getIconForAmenity(amenity);
                return (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                    <IconComponent className="h-4 w-4 text-teal-600" />
                    <span className="text-sm capitalize">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Room Types */}
      {hotel.room_types && Array.isArray(hotel.room_types) && hotel.room_types.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Room Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hotel.room_types.map((room: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-lg">{room.name}</h4>
                    <div className="text-right">
                      <p className="font-semibold text-teal-600">${room.rate}/night</p>
                      {room.childRate && (
                        <p className="text-sm text-gray-600">Child: ${room.childRate}/night</p>
                      )}
                    </div>
                  </div>
                  {room.description && (
                    <p className="text-gray-600 mb-2">{room.description}</p>
                  )}
                  {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.map((amenity: string, amenityIndex: number) => (
                        <Badge key={amenityIndex} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policies */}
      {hotel.policies && (
        <Card>
          <CardHeader>
            <CardTitle>Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hotel.policies.cancellation && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Cancellation Policy</h4>
                <p className="text-gray-600">{hotel.policies.cancellation}</p>
              </div>
            )}
            {hotel.policies.petPolicy && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Pet Policy</h4>
                <p className="text-gray-600">{hotel.policies.petPolicy}</p>
              </div>
            )}
            {hotel.policies.smokingPolicy && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Smoking Policy</h4>
                <p className="text-gray-600">{hotel.policies.smokingPolicy}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HotelDetails;
