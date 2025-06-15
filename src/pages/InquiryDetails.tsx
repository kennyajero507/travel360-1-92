
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage,
  BreadcrumbSeparator 
} from "../components/ui/breadcrumb";
import { getInquiryById } from "../services/inquiry";
import { InquiryData } from "../types/inquiry.types";
import { InquiryDetailsView } from "../components/inquiry/InquiryDetailsView";
import { toast } from "sonner";
import { ArrowLeft, Edit } from "lucide-react";

const InquiryDetails = () => {
  const { inquiryId } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<InquiryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        if (!inquiryId) {
          toast.error("No inquiry ID provided");
          navigate("/inquiries");
          return;
        }

        const data = await getInquiryById(inquiryId);
        if (!data) {
          toast.error("Inquiry not found");
          navigate("/inquiries");
          return;
        }

        setInquiry(data);
      } catch (error) {
        console.error("Error fetching inquiry:", error);
        toast.error("Failed to load inquiry");
        navigate("/inquiries");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [inquiryId, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading inquiry details...</div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="text-center text-red-500">
        <p>Inquiry not found</p>
        <Button onClick={() => navigate("/inquiries")} className="mt-4">
          Back to Inquiries
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/inquiries">Inquiries</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Inquiry Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/inquiries")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inquiries
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Inquiry Details
          </h1>
        </div>
        <Button
          onClick={() => navigate(`/inquiries/edit/${inquiry.id}`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Inquiry
        </Button>
      </div>

      {/* Inquiry Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {inquiry.enquiry_number ? `Inquiry #${inquiry.enquiry_number}` : 'Inquiry Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InquiryDetailsView inquiry={inquiry} />
        </CardContent>
      </Card>
    </div>
  );
};

export default InquiryDetails;
