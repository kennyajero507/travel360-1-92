
import { Link } from 'react-router-dom';
import { useClientDetails } from '../hooks/useClientDetails';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Edit, Mail, Phone, MapPin } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const ClientDetailsPage = () => {
  const { client, isLoading, isError } = useClientDetails();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Could not find client data.</p>
        <Button asChild variant="link">
          <Link to="/clients">Back to Clients</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/clients" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to all clients
      </Link>
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Client Details</h1>
        <Button disabled>
          <Edit className="h-4 w-4 mr-2" />
          Edit Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{client.name}</CardTitle>
          <CardDescription>Client ID: {client.id}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-3 text-gray-500" />
            <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
              {client.email}
            </a>
          </div>
          {client.phone && (
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-3 text-gray-500" />
              <span>{client.phone}</span>
            </div>
          )}
          {client.location && (
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-3 text-gray-500" />
              <span>{client.location}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Quotes associated with this client will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetailsPage;
