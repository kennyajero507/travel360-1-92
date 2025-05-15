
import { Card, CardContent } from "../ui/card";

interface ClientDetailsCardProps {
  client: string;
  mobile: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: {
    days: number;
    nights: number;
  };
  status: string;
}

const ClientDetailsCard = ({
  client,
  mobile,
  destination,
  startDate,
  endDate,
  duration,
  status
}: ClientDetailsCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Client</p>
            <p className="font-medium">{client}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Mobile</p>
            <p>{mobile}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Destination</p>
            <p>{destination}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Travel Period</p>
            <p>
              {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Duration</p>
            <p>{duration.days} days / {duration.nights} nights</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="capitalize">{status}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientDetailsCard;
