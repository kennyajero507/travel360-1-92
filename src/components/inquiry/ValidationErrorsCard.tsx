
import { Card, CardContent } from "../ui/card";
import { AlertCircle } from "lucide-react";

interface ValidationErrorsCardProps {
  validationErrors: string[];
}

export const ValidationErrorsCard = ({ validationErrors }: ValidationErrorsCardProps) => {
  if (validationErrors.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-red-800 mb-3">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Please fix the following errors:</span>
        </div>
        <ul className="list-disc list-inside text-red-700 space-y-1 ml-7">
          {validationErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
