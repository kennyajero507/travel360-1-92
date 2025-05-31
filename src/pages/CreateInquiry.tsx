
import { CreateInquiryForm } from "../components/inquiry/CreateInquiryForm";

const CreateInquiry = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Create New Inquiry</h1>
          <p className="text-gray-500 mt-2">Record a new client inquiry for domestic or international tours</p>
        </div>
      </div>

      <CreateInquiryForm />
    </div>
  );
};

export default CreateInquiry;
