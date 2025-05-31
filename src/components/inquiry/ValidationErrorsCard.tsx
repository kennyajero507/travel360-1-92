
import { Card, CardContent } from "../ui/card";

interface ValidationErrorsCardProps {
  validationErrors: string[];
}

export const ValidationErrorsCard = ({ validationErrors }: ValidationErrorsCardProps) => {
  if (validationErrors.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-red-800 mb-2">
          <div className="h-4 w-4 rounded-full bg-red-600"></div>
          <span className="font-medium">Please fix the following errors:</span>
        </div>
        <ul className="list-disc list-inside text-red-700 space-y-1">
          {validationErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
