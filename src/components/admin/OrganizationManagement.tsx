
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Search, Users, Ban, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';

const OrganizationManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: adminService.getAllOrganizations,
  });

  const filteredOrganizations = organizations?.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSuspendOrganization = async (orgId: string) => {
    try {
      await adminService.suspendOrganization(orgId);
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
    } catch (error) {
      console.error('Error suspending organization:', error);
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    try {
      await adminService.deleteOrganization(orgId);
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
    } catch (error) {
      console.error('Error deleting organization:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'trial': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isTrialExpired = (trialEnd: string) => {
    return new Date(trialEnd) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading organizations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Management</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Trial Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrganizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-gray-500">
                      Created {new Date(org.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{org.owner_name || 'No owner'}</div>
                    <div className="text-sm text-gray-500">{org.owner_email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(org.subscription_status)}>
                    {org.subscription_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{org.user_count}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{org.monthly_quote_count} quotes</div>
                    <div>{org.monthly_booking_count} bookings</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {org.subscription_status === 'trial' && (
                      <Badge variant={isTrialExpired(org.trial_end) ? "destructive" : "secondary"}>
                        {isTrialExpired(org.trial_end) ? 'Expired' : 'Active'}
                      </Badge>
                    )}
                    {org.subscription_status === 'trial' && (
                      <div className="text-xs text-gray-500 mt-1">
                        Until {new Date(org.trial_end).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {org.subscription_status !== 'suspended' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-orange-600">
                            <Ban className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Suspend Organization</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to suspend {org.name}? 
                              This will prevent all users in this organization from accessing the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleSuspendOrganization(org.id)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              Suspend
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete {org.name}? 
                            This action cannot be undone and will remove all users from the organization.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteOrganization(org.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default OrganizationManagement;
