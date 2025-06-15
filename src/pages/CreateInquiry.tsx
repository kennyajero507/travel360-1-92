
import { CreateInquiryForm } from "../components/inquiry/CreateInquiryForm";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const CreateInquiry = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Inquiry</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateInquiryForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateInquiry;
