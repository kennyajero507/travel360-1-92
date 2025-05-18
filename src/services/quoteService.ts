
import { QuoteData } from "../types/quote.types";

// Mock data
const mockQuotes = {
  "Q-2023-001": {
    id: "Q-2023-001",
    inquiryId: "I-2024-001",
    client: "John Smith",
    mobile: "+1 (555) 123-4567",
    destination: "Zanzibar",
    startDate: "2024-08-20",
    endDate: "2024-08-27",
    duration: {
      days: 8,
      nights: 7
    },
    travelers: {
      adults: 2,
      childrenWithBed: 1,
      childrenNoBed: 1,
      infants: 0
    },
    roomArrangements: [
      {
        id: "room-1",
        roomType: "Family Room",
        numRooms: 1,
        adults: 2,
        childrenWithBed: 1,
        childrenNoBed: 1,
        infants: 0,
        ratePerNight: {
          adult: 95,
          childWithBed: 70,
          childNoBed: 45,
          infant: 0
        },
        nights: 7,
        total: 1995
      }
    ],
    activities: [
      {
        id: "activity-1",
        name: "Spice Tour",
        description: "Half-day guided tour of spice plantations",
        costPerPerson: {
          adult: 45,
          child: 25,
          infant: 0
        },
        included: {
          adults: 2,
          children: 2,
          infants: 0
        },
        total: 140
      },
      {
        id: "activity-2",
        name: "Prison Island Tour",
        description: "Visit historical prison island with giant tortoises",
        costPerPerson: {
          adult: 65,
          child: 35,
          infant: 0
        },
        included: {
          adults: 2,
          children: 2,
          infants: 0
        },
        total: 200
      }
    ],
    transports: [
      {
        id: "transport-1",
        type: "Airport Transfer",
        description: "Round trip airport transfers",
        costPerPerson: {
          adult: 30,
          child: 30,
          infant: 0
        },
        included: {
          adults: 2,
          children: 2,
          infants: 0
        },
        total: 120
      }
    ],
    markup: {
      type: "percentage" as "percentage" | "fixed",
      value: 15
    },
    notes: "Client prefers beachfront accommodation and has interest in water activities.",
    status: "sent" as "draft" | "sent" | "approved" | "rejected",
    createdBy: "agent1",
    createdAt: "2023-12-15T08:30:00Z",
    updatedAt: "2023-12-16T14:22:00Z"
  }
};

// Get quote by ID
export const getQuoteById = async (quoteId: string): Promise<QuoteData | null> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const quote = mockQuotes[quoteId as keyof typeof mockQuotes];
      resolve(quote || null);
    }, 500);
  });
};

// Save or update a quote
export const saveQuote = async (quote: QuoteData): Promise<QuoteData> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate ID if new quote
      if (!quote.id) {
        quote.id = `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      }
      
      // Update timestamps
      quote.updatedAt = new Date().toISOString();
      if (!quote.createdAt) {
        quote.createdAt = quote.updatedAt;
      }
      
      // Ensure the markup type is one of the allowed values
      if (quote.markup && typeof quote.markup.type === 'string') {
        if (!['percentage', 'fixed', 'cost-plus'].includes(quote.markup.type)) {
          quote.markup.type = 'percentage';
        }
      }
      
      // Using type assertion to fix the TypeScript error
      mockQuotes[quote.id] = quote as any;
      resolve(quote);
    }, 700);
  });
};

// Update quote status
export const updateQuoteStatus = async (
  quoteId: string, 
  status: "draft" | "sent" | "approved" | "rejected"
): Promise<boolean> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const quote = mockQuotes[quoteId as keyof typeof mockQuotes];
      if (quote) {
        quote.status = status;
        quote.updatedAt = new Date().toISOString();
        resolve(true);
      } else {
        resolve(false);
      }
    }, 300);
  });
};
