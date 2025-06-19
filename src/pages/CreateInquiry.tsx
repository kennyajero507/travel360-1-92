
import { SimplifiedInquiryForm } from "../components/inquiry/SimplifiedInquiryForm";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const CreateInquiry = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Inquiry</CardTitle>
          <p className="text-gray-600">Fill in the essential information to create a new travel inquiry</p>
        </CardHeader>
        <CardContent>
          <SimplifiedInquiryForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateInquiry;
