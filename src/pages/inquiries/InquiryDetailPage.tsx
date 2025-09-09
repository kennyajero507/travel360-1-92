import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSimpleAuth } from '../../contexts/SimpleAuthContext';
import { useInquiries } from '../../hooks/useInquiries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Clock,
  FileText,
  MessageSquare,
  Quote,
  UserCheck
} from 'lucide-react';
import type { DatabaseInquiry } from '../../types/database';

const InquiryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useSimpleAuth();
  const { inquiries, updateInquiry, loading } = useInquiries();
  const [inquiry, setInquiry] = useState<DatabaseInquiry | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (inquiries.length > 0 && id) {
      const foundInquiry = inquiries.find(inq => inq.id === id);
      setInquiry(foundInquiry || null);
    }
  }, [inquiries, id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Assigned': return 'bg-yellow-100 text-yellow-800';
      case 'Quoted': return 'bg-green-100 text-green-800';
      case 'Booked': return 'bg-purple-100 text-purple-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!inquiry) return;
    
    setIsUpdating(true);
    try {
      await updateInquiry(inquiry.id, { status: newStatus });
      setInquiry(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignAgent = async (agentId: string) => {
    if (!inquiry) return;
    
    setIsUpdating(true);
    try {
      await updateInquiry(inquiry.id, { 
        assigned_to: agentId === 'unassigned' ? null : agentId,
        status: agentId === 'unassigned' ? 'New' : 'Assigned'
      });
      setInquiry(prev => prev ? { 
        ...prev, 
        assigned_to: agentId === 'unassigned' ? null : agentId,
        status: agentId === 'unassigned' ? 'New' : 'Assigned'
      } : null);
      toast.success('Agent assignment updated');
    } catch (error) {
      toast.error('Failed to update assignment');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Inquiry not found</h3>
        <p className="mt-1 text-sm text-gray-500">The inquiry you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/inquiries">Back to Inquiries</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalGuests = (inquiry.adults || 0) + (inquiry.children || 0);
  const canManageInquiry = profile?.role === 'org_owner' || profile?.role === 'tour_operator';
  const canAssignAgents = profile?.role === 'org_owner' || profile?.role === 'tour_operator';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/inquiries">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inquiries
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {inquiry.enquiry_number || `INQ-${inquiry.id.slice(0, 8)}`}
            </h1>
            <p className="text-gray-600 mt-1">Travel inquiry details and management</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(inquiry.status)}>
            {inquiry.status}
          </Badge>
          {canManageInquiry && (
            <Button asChild variant="outline">
              <Link to={`/inquiries/${inquiry.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Inquiry
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes & Comments</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Client Name</p>
                      <p className="text-lg font-semibold">{inquiry.client_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Guests</p>
                      <p className="text-lg font-semibold">{totalGuests} guests</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inquiry.client_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Email</p>
                          <p className="text-sm">{inquiry.client_email}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Mobile</p>
                        <p className="text-sm">{inquiry.client_mobile}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Travel Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Travel Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Destination</p>
                      <p className="text-lg font-semibold">{inquiry.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tour Type</p>
                      <Badge variant="outline">{inquiry.tour_type}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Check-in Date</p>
                        <p className="text-sm">{new Date(inquiry.check_in_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Check-out Date</p>
                        <p className="text-sm">{new Date(inquiry.check_out_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Adults</p>
                      <p className="text-lg font-semibold">{inquiry.adults}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Children</p>
                      <p className="text-lg font-semibold">{inquiry.children || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Days</p>
                      <p className="text-lg font-semibold">{inquiry.days_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nights</p>
                      <p className="text-lg font-semibold">{inquiry.nights_count || 0}</p>
                    </div>
                  </div>

                  {inquiry.special_requirements && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-2">Special Requirements</p>
                      <p className="text-sm text-blue-800">{inquiry.special_requirements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Track the progress of this inquiry</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Inquiry Created</p>
                        <p className="text-sm text-gray-600">
                          {new Date(inquiry.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {inquiry.assigned_to && (
                      <div className="flex items-start gap-4">
                        <div className="bg-yellow-100 p-2 rounded-full">
                          <UserCheck className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">Agent Assigned</p>
                          <p className="text-sm text-gray-600">Assigned to agent</p>
                        </div>
                      </div>
                    )}
                    
                    {inquiry.status === 'Quoted' && (
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Quote className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Quote Created</p>
                          <p className="text-sm text-gray-600">Quote has been generated for this inquiry</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Notes & Comments</CardTitle>
                  <CardDescription>Internal notes and communication history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">No notes yet</p>
                    <p className="text-xs text-gray-500">Notes and comments will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Current Status</p>
                <Badge className={getStatusColor(inquiry.status)}>
                  {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                </Badge>
              </div>
              
              {canManageInquiry && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Update Status</p>
                  <Select
                    value={inquiry.status}
                    onValueChange={handleStatusUpdate}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Assigned">Assigned</SelectItem>
                      <SelectItem value="Quoted">Quoted</SelectItem>
                      <SelectItem value="Booked">Booked</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent Assignment */}
          {canAssignAgents && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agent Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Assigned Agent</p>
                  <Select
                    value={inquiry.assigned_to || 'unassigned'}
                    onValueChange={handleAssignAgent}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      <SelectItem value="agent-1">Agent 1</SelectItem>
                      <SelectItem value="agent-2">Agent 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inquiry.status === 'Assigned' && (
                <Button asChild className="w-full">
                  <Link to={`/quotes/create?inquiry=${inquiry.id}`}>
                    <Quote className="h-4 w-4 mr-2" />
                    Create Quote
                  </Link>
                </Button>
              )}
              
              <Button variant="outline" className="w-full" asChild>
                <Link to={`mailto:${inquiry.client_email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link to={`tel:${inquiry.client_mobile}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Client
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Inquiry Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inquiry Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-gray-600">{new Date(inquiry.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              {inquiry.updated_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-gray-600">{new Date(inquiry.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Inquiry ID</p>
                  <p className="text-gray-600 font-mono">{inquiry.id.slice(0, 8)}...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetailPage;