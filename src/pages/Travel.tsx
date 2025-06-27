
import React, { useState } from "react";
import { useQuoteData } from "../hooks/useQuoteData";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

const Travel = () => {
  const { data: quotes = [], isLoading, error } = useQuoteData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter quotes based on search term and status
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status counts for the filter tabs
  const statusCounts = {
    all: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent').length,
    approved: quotes.filter(q => q.status === 'approved').length,
    rejected: quotes.filter(q => q.status === 'rejected').length,
    expired: quotes.filter(q => q.status === 'expired').length,
  };

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">There was an error loading your travel quotes. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Travel Quotes</h1>
          <p className="text-gray-600">Manage your travel quotes and proposals</p>
        </div>
        <Link to="/create-quote">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Quote
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by client name or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quotes ({statusCounts.all})</SelectItem>
                <SelectItem value="draft">Draft ({statusCounts.draft})</SelectItem>
                <SelectItem value="sent">Sent ({statusCounts.sent})</SelectItem>
                <SelectItem value="approved">Approved ({statusCounts.approved})</SelectItem>
                <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
                <SelectItem value="expired">Expired ({statusCounts.expired})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Grid */}
      {filteredQuotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by creating your first travel quote"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link to="/create-quote">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Quote
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{quote.client}</CardTitle>
                    <p className="text-sm text-gray-600">{quote.destination}</p>
                  </div>
                  <Badge className={getStatusColor(quote.status as QuoteStatus)}>
                    {quote.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {quote.start_date ? format(new Date(quote.start_date), "MMM dd, yyyy") : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-medium">
                      {quote.duration_days ? `${quote.duration_days} days` : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Adults</p>
                    <p className="font-medium">{quote.adults || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Children</p>
                    <p className="font-medium">{(quote.children_with_bed || 0) + (quote.children_no_bed || 0)}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Link to={`/quotes/${quote.id}/preview`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Link to={`/edit-quote/${quote.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="px-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Travel;
