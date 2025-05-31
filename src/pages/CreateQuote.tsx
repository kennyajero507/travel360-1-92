
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import QuoteInitializer from "../components/quote/QuoteInitializer";
import { getAllInquiries } from "../services/inquiryService";
import { saveQuote } from "../services/quoteService";
import { QuoteData } from "../types/quote.types";
import LoadingIndicator from "../components/quote/LoadingIndicator";

const CreateQuote = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInquiries = async () => {
      try {
        const data = await getAllInquiries();
        // Filter for assigned inquiries that don't have quotes yet
        const availableInquiries = data.filter((inquiry: any) => 
          inquiry.status === 'Assigned' || inquiry.status === 'New'
        );
        setInquiries(availableInquiries);
      } catch (error) {
        console.error("Error loading inquiries:", error);
        toast.error("Failed to load inquiries");
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();
  }, []);

  const handleInitializeQuote = async (quote: QuoteData) => {
    try {
      console.log("Initializing quote with data:", quote);
      const savedQuote = await saveQuote(quote);
      toast.success("Quote initialized successfully");
      // Navigate to quote editor with the quote ID
      navigate(`/quotes/edit/${savedQuote.id}`);
    } catch (error) {
      console.error("Error initializing quote:", error);
      toast.error("Failed to initialize quote");
    }
  };

  const handleCancel = () => {
    navigate("/quotes");
  };

  if (loading) {
    return <LoadingIndicator message="Loading inquiries..." />;
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Inquiries Available</h2>
        <p className="text-gray-600 mb-6">
          There are no assigned inquiries available for quote creation.
        </p>
        <button 
          onClick={() => navigate("/inquiries")}
          className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700"
        >
          View Inquiries
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-teal-600">Create New Quote</h1>
        <p className="text-gray-500 mt-2">
          Select an inquiry to initialize a new quote with pre-filled information.
        </p>
      </div>
      
      <QuoteInitializer
        inquiries={inquiries}
        onInitializeQuote={handleInitializeQuote}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateQuote;
