
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Building } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface OrganizationFormProps {
  onSubmit: (organizationName: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const OrganizationForm = ({ onSubmit, loading, error }: OrganizationFormProps) => {
  const [organizationName, setOrganizationName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(organizationName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-center mb-4">
        <Building className="h-16 w-16 text-teal-600" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="organizationName">Organization Name <span className="text-red-500">*</span></Label>
        <Input
          id="organizationName"
          name="organizationName"
          type="text"
          placeholder="Acme Travel Agency"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          required
          className="w-full"
        />
        <p className="text-xs text-gray-500">
          This will be the name of your travel business in TravelFlow360
        </p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm">
        <p className="font-semibold text-blue-700">Your organization benefits:</p>
        <ul className="list-disc ml-5 mt-2 text-blue-700">
          <li>2-week free trial automatically included</li>
          <li>Ability to invite up to 5 team members on Starter plan</li>
          <li>Custom dashboards and reports</li>
          <li>Manage hotel inventory and preferred suppliers</li>
          <li>Upgrade anytime to add more team members</li>
        </ul>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-700"
        disabled={loading}
      >
        {loading ? "Creating Organization..." : "Create My Organization"}
      </Button>
    </form>
  );
};

export default OrganizationForm;
