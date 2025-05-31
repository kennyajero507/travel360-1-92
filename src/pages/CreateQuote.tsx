
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import QuoteInitializer from "../components/quote/QuoteInitializer";
import { getAllInquiries, getInquiryById } from "../services/inquiryService";
import { saveQuote } from "../services/quoteService";
import { QuoteData } from "../types/quote.types";
import LoadingIndicator from "../components/quote/LoadingIndicator";

const CreateQuote = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inquiryId = searchParams.get('inquiryId');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // If there's an inquiryId in the URL, load that specific inquiry
        if (inquiryId) {
          console.log("Loading specific inquiry:", inquiryId);
          const inquiry = await getInquiryById(inquiryId);
          if (inquiry) {
            setSelectedInquiry(inquiry);
            setInquiries([inquiry]);
          } else {
            toast.error("Inquiry not found");
            navigate("/inquiries");
            return;
          }
        } else {
          // Load all inquiries
          const data = await getAllInquiries();
          // Filter for assigned inquiries that don't have quotes yet
          const availableInquiries = data.filter((inquiry: any) => 
            inquiry.status === 'Assigned' || inquiry.status === 'New'
          );
          setInquiries(availableInquiries);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load inquiry data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [inquiryId, navigate]);

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
    if (inquiryId) {
      navigate(`/inquiries/${inquiryId}`);
    } else {
      navigate("/quotes");
    }
  };

  if (loading) {
    return <LoadingIndicator message="Loading inquiry data..." />;
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {inquiryId ? "Inquiry Not Found" : "No Inquiries Available"}
        </h2>
        <p className="text-gray-600 mb-6">
          {inquiryId 
            ? "The requested inquiry could not be found or accessed." 
            : "There are no assigned inquiries available for quote creation."
          }
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
          {selectedInquiry 
            ? `Creating quote for inquiry ${selectedInquiry.enquiry_number || selectedInquiry.id}` 
            : "Select an inquiry to initialize a new quote with pre-filled information."
          }
        </p>
      </div>
      
      <QuoteInitializer
        inquiries={inquiries}
        onInitializeQuote={handleInitializeQuote}
        onCancel={handleCancel}
        preselectedInquiry={selectedInquiry}
      />
    </div>
  );
};

export default CreateQuote;
