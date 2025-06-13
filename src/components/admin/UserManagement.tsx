
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Search, MoreHorizontal, UserCog, Ban } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, SystemUser } from '../../services/adminService';
import { toast } from 'sonner';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getAllUsers,
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await adminService.suspendUser(userId);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'system_admin': return 'bg-red-100 text-red-800';
      case 'org_owner': return 'bg-purple-100 text-purple-800';
      case 'tour_operator': return 'bg-blue-100 text-blue-800';
      case 'agent': return 'bg-green-100 text-green-800';
      case 'client': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading users...</CardTitle>
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
        <CardTitle>User Management</CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="system_admin">System Admin</SelectItem>
              <SelectItem value="org_owner">Org Owner</SelectItem>
              <SelectItem value="tour_operator">Tour Operator</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.full_name || 'No name'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role?.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.organization_name || 'No organization'}
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <UserCog className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User Role</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">User: {user.full_name || user.email}</label>
                          </div>
                          <Select 
                            defaultValue={user.role} 
                            onValueChange={(value) => handleRoleChange(user.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="system_admin">System Admin</SelectItem>
                              <SelectItem value="org_owner">Org Owner</SelectItem>
                              <SelectItem value="tour_operator">Tour Operator</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                              <SelectItem value="client">Client</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {user.role !== 'suspended' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Ban className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Suspend User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to suspend {user.full_name || user.email}? 
                              This will prevent them from accessing the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleSuspendUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Suspend
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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

export default UserManagement;
