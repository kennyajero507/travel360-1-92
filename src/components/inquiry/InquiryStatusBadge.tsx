
import { Badge } from "../../components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "new": return "bg-blue-100 text-blue-800";
    case "assigned": return "bg-yellow-100 text-yellow-800";
    case "quoted": return "bg-green-100 text-green-800";
    case "closed": return "bg-gray-100 text-gray-800";
    default: return "bg-blue-100 text-blue-800";
  }
};

export const InquiryStatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge variant="outline" className={getStatusColor(status || 'New')}>
      {status || 'New'}
    </Badge>
  );
};

interface PriorityBadgeProps {
  priority: string;
}

export const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "urgent": return "bg-red-100 text-red-800";
    case "high": return "bg-orange-100 text-orange-800";
    case "normal": return "bg-green-100 text-green-800";
    case "low": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  return (
    <Badge variant="outline" className={getPriorityColor(priority || 'Normal')}>
      {priority || 'Normal'}
    </Badge>
  );
};
