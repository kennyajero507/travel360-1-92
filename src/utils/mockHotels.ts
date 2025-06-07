
import { Hotel } from "../types/hotel.types";

export const mockHotels: Hotel[] = [
  {
    id: "1",
    name: "Grand Plaza Hotel",
    destination: "Dubai, UAE",
    category: "Luxury",
    status: "Active",
    address: "Downtown Dubai, Sheikh Zayed Road",
    location: "Dubai Marina",
    description: "A luxurious 5-star hotel in the heart of Dubai",
    additional_details: {
      description: "Experience luxury redefined at Grand Plaza Hotel. Located in the prestigious downtown area, our hotel offers world-class amenities and unparalleled service.",
      contactPerson: "Ahmed Hassan",
      contactEmail: "reservations@grandplaza.com",
      contactPhone: "+971 4 123 4567",
      hasNegotiatedRate: true,
      website: "www.grandplaza.com"
    },
    amenities: ["Pool", "Spa", "Gym", "Restaurant", "WiFi", "Business Center"],
    room_types: [
      {
        id: "deluxe",
        name: "Deluxe Room",
        maxOccupancy: 2,
        bedOptions: "King Bed",
        ratePerNight: 250,
        amenities: ["WiFi", "Mini Bar", "City View"],
        totalUnits: 50
      }
    ],
    images: ["hotel1.jpg", "hotel1-2.jpg"],
    contact_info: {
      email: "info@grandplaza.com",
      phone: "+971 4 123 4567"
    },
    created_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Beach Resort Maldives",
    destination: "Maldives",
    category: "Resort",
    status: "Active",
    address: "North Male Atoll, Maldives",
    location: "North Male Atoll",
    description: "Overwater villas with pristine beaches",
    additional_details: {
      description: "Escape to paradise at Beach Resort Maldives. Our overwater villas offer direct access to crystal-clear waters and stunning coral reefs.",
      contactPerson: "Maria Santos",
      contactEmail: "bookings@beachresortmaldives.com",
      contactPhone: "+960 123 4567",
      hasNegotiatedRate: false,
      website: "www.beachresortmaldives.com"
    },
    amenities: ["Private Beach", "Diving Center", "Spa", "Restaurant"],
    room_types: [
      {
        id: "villa",
        name: "Overwater Villa",
        maxOccupancy: 4,
        bedOptions: "King Bed + Sofa Bed",
        ratePerNight: 800,
        amenities: ["Private Deck", "Glass Floor", "Direct Ocean Access"],
        totalUnits: 20
      }
    ],
    images: ["resort1.jpg"],
    contact_info: {
      email: "info@beachresort.com",
      phone: "+960 123 4567"
    },
    created_at: "2024-01-02T00:00:00Z"
  },
  {
    id: "3",
    name: "City Business Hotel",
    destination: "London, UK",
    category: "Business",
    status: "Active",
    address: "Central London, Westminster",
    location: "Westminster",
    description: "Modern business hotel in central London",
    additional_details: {
      description: "Perfect for business travelers, our hotel is located in the heart of London's business district with easy access to major corporate offices.",
      contactPerson: "James Wilson",
      contactEmail: "reservations@citybusinesshotel.co.uk",
      contactPhone: "+44 20 1234 5678",
      hasNegotiatedRate: true,
      website: "www.citybusinesshotel.co.uk"
    },
    amenities: ["Business Center", "Conference Rooms", "WiFi", "Gym"],
    room_types: [
      {
        id: "executive",
        name: "Executive Room",
        maxOccupancy: 2,
        bedOptions: "Queen Bed",
        ratePerNight: 180,
        amenities: ["Work Desk", "WiFi", "Coffee Machine"],
        totalUnits: 100
      }
    ],
    images: ["business1.jpg"],
    contact_info: {
      email: "info@citybusiness.com",
      phone: "+44 20 1234 5678"
    },
    created_at: "2024-01-03T00:00:00Z"
  },
  {
    id: "4",
    name: "Budget Inn Express",
    destination: "Bangkok, Thailand",
    category: "Budget",
    status: "Active",
    address: "Khao San Road, Bangkok",
    location: "Khao San Road",
    description: "Affordable accommodation in the heart of Bangkok",
    additional_details: {
      description: "Clean, comfortable, and affordable accommodation perfect for backpackers and budget-conscious travelers exploring Bangkok.",
      contactPerson: "Siriporn Thanakit",
      contactEmail: "info@budgetinnexpress.com",
      contactPhone: "+66 2 123 4567",
      hasNegotiatedRate: false,
      website: "www.budgetinnexpress.com"
    },
    amenities: ["WiFi", "24/7 Reception", "Luggage Storage"],
    room_types: [
      {
        id: "standard",
        name: "Standard Room",
        maxOccupancy: 2,
        bedOptions: "Twin Beds",
        ratePerNight: 35,
        amenities: ["Air Conditioning", "Private Bathroom", "WiFi"],
        totalUnits: 80
      }
    ],
    images: ["budget1.jpg"],
    contact_info: {
      email: "info@budgetinn.com",
      phone: "+66 2 123 4567"
    },
    created_at: "2024-01-04T00:00:00Z"
  },
  {
    id: "5",
    name: "Boutique Heritage Hotel",
    destination: "Paris, France",
    category: "Boutique",
    status: "Active",
    address: "Le Marais District, Paris",
    location: "Le Marais",
    description: "Charming boutique hotel with historic character",
    additional_details: {
      description: "Experience Parisian charm at its finest in our beautifully restored 18th-century building, featuring unique decor and personalized service.",
      contactPerson: "Claire Dubois",
      contactEmail: "reservations@boutiqueheritage.fr",
      contactPhone: "+33 1 23 45 67 89",
      hasNegotiatedRate: true,
      website: "www.boutiqueheritage.fr"
    },
    amenities: ["Historic Architecture", "Art Gallery", "Wine Bar", "Concierge"],
    room_types: [
      {
        id: "heritage",
        name: "Heritage Suite",
        maxOccupancy: 2,
        bedOptions: "King Bed",
        ratePerNight: 320,
        amenities: ["Historic Decor", "Marble Bathroom", "City View"],
        totalUnits: 25
      }
    ],
    images: ["boutique1.jpg"],
    contact_info: {
      email: "info@boutique.com",
      phone: "+33 1 23 45 67 89"
    },
    created_at: "2024-01-05T00:00:00Z"
  }
];
