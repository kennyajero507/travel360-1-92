
import { Hotel } from "../types/hotel.types";

// Convert mock hotels to match the Hotel type
export const mockHotels: Hotel[] = [
  {
    id: "H-001",
    name: "Serena Hotel",
    address: "123 Main Street",
    destination: "Nairobi, Kenya",
    category: "5-Star",
    contactDetails: {},
    status: "Active",
    additionalDetails: {
      hasNegotiatedRate: true,
      website: "https://serenahotels.com"
    },
    roomTypes: [{
      id: "room-1",
      name: "Standard Room",
      maxOccupancy: 2,
      bedOptions: "Queen",
      ratePerNight: 250,
      ratePerPersonPerNight: 125,
      amenities: ["Pool", "Spa", "Restaurant", "WiFi"],
      totalUnits: 20
    }]
  },
  {
    id: "H-002",
    name: "Zanzibar Beach Resort",
    address: "Beach Road",
    destination: "Zanzibar, Tanzania",
    category: "4-Star",
    contactDetails: {},
    status: "Active",
    additionalDetails: {
      hasNegotiatedRate: true,
      website: "https://zanzibar-resort.com"
    },
    roomTypes: [{
      id: "room-2",
      name: "Beach View Room",
      maxOccupancy: 2,
      bedOptions: "King",
      ratePerNight: 180,
      ratePerPersonPerNight: 90,
      amenities: ["Beach Access", "Pool", "Restaurant", "WiFi"],
      totalUnits: 15
    }]
  },
  {
    id: "H-003",
    name: "Cape Town Luxury Suites",
    address: "Cape Town Harbor",
    destination: "Cape Town, South Africa",
    category: "5-Star",
    contactDetails: {},
    status: "Active",
    additionalDetails: {
      hasNegotiatedRate: false,
      website: "https://capetown-suites.com"
    },
    roomTypes: [{
      id: "room-3",
      name: "Luxury Suite",
      maxOccupancy: 3,
      bedOptions: "King",
      ratePerNight: 320,
      ratePerPersonPerNight: 110,
      amenities: ["Pool", "Spa", "Gym", "Restaurant", "WiFi"],
      totalUnits: 10
    }]
  },
  {
    id: "H-004",
    name: "Marrakech Riad",
    address: "Medina Quarter",
    destination: "Marrakech, Morocco",
    category: "4-Star",
    contactDetails: {},
    status: "Active",
    additionalDetails: {
      hasNegotiatedRate: true,
      website: "https://marrakech-riad.com"
    },
    roomTypes: [{
      id: "room-4",
      name: "Traditional Room",
      maxOccupancy: 2,
      bedOptions: "Queen",
      ratePerNight: 150,
      ratePerPersonPerNight: 75,
      amenities: ["Pool", "Restaurant", "WiFi"],
      totalUnits: 12
    }]
  },
  {
    id: "H-005",
    name: "Safari Lodge",
    address: "National Park",
    destination: "Maasai Mara, Kenya",
    category: "4-Star",
    contactDetails: {},
    status: "Inactive",
    additionalDetails: {
      hasNegotiatedRate: false,
      website: "https://safari-lodge.com"
    },
    roomTypes: [{
      id: "room-5",
      name: "Safari Tent",
      maxOccupancy: 2,
      bedOptions: "Queen",
      ratePerNight: 420,
      ratePerPersonPerNight: 210,
      amenities: ["Game Drives", "Restaurant", "WiFi"],
      totalUnits: 8
    }]
  },
];
