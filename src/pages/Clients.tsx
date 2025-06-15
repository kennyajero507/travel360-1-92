import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Plus, MoreHorizontal, FileText, Loader2, Eye } from "lucide-react";
import { useClientsData } from "../hooks/useClientsData";
import { NewClient } from "../types/client.types";
import { Skeleton } from "@/components/ui/skeleton";

const Clients = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState<NewClient>({
    name: "",
    email: "",
    phone: "",
    location: ""
  });
  
  const { clients, isLoading, isError, search, setSearch, createClient } = useClientsData();
  const navigate = useNavigate();

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    await createClient(newClient);
    setIsDialogOpen(false);
    setNewClient({ name: "", email: "", phone: "", location: "" });
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4">
              <Skeleton className="h-10 w-1/6" />
              <Skeleton className="h-10 w-1/6" />
              <Skeleton className="h-10 w-1/6" />
              <Skeleton className="h-10 w-1/6" />
              <Skeleton className="h-10 w-1/6" />
              <Skeleton className="h-10 w-1/6" />
            </div>
          ))}
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="text-center py-10 text-red-500">
          <p>Failed to load clients. Please try again later.</p>
        </div>
      );
    }
    
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.id.substring(0, 8)}...</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.location}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Client Details
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <FileText className="mr-2 h-4 w-4" />
                        Create New Quote
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <FileText className="mr-2 h-4 w-4" />
                        View Client Quotes
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-gray-500 mt-2">Manage all your clients and their travel quotes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="self-start">
              <Plus className="mr-2 h-4 w-4" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Enter the details of your new client below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="Enter client name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  value={newClient.phone || ''}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-2">
                  Location
                </label>
                <Input
                  id="location"
                  value={newClient.location || ''}
                  onChange={(e) => setNewClient({...newClient, location: e.target.value})}
                  placeholder="City, Country"
                />
              </div>
              <DialogFooter>
                <Button type="submit">Add Client</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;
