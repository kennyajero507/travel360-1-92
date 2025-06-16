
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';

interface RolePermission {
  id: string;
  role: string;
  permission: string;
  resource: string;
  action: string;
  created_at: string;
}

const RolePermissionsManager = () => {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<RolePermission | null>(null);

  const roles = ['system_admin', 'org_owner', 'tour_operator', 'agent', 'client'];
  const resources = ['*', 'organization', 'users', 'quotes', 'bookings', 'inquiries', 'hotels', 'reports'];
  const actions = ['*', 'all', 'create', 'read', 'update', 'delete', 'manage', 'view', 'assigned'];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('role', { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const savePermission = async (permissionData: Omit<RolePermission, 'id' | 'created_at'>) => {
    try {
      if (editingPermission) {
        const { error } = await supabase
          .from('role_permissions')
          .update(permissionData)
          .eq('id', editingPermission.id);

        if (error) throw error;
        toast.success('Permission updated successfully');
      } else {
        const { error } = await supabase
          .from('role_permissions')
          .insert([permissionData]);

        if (error) throw error;
        toast.success('Permission created successfully');
      }

      setDialogOpen(false);
      setEditingPermission(null);
      fetchPermissions();
    } catch (error) {
      console.error('Error saving permission:', error);
      toast.error('Failed to save permission');
    }
  };

  const deletePermission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;

    try {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Permission deleted successfully');
      fetchPermissions();
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast.error('Failed to delete permission');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'system_admin': return 'bg-red-100 text-red-800';
      case 'org_owner': return 'bg-blue-100 text-blue-800';
      case 'tour_operator': return 'bg-green-100 text-green-800';
      case 'agent': return 'bg-yellow-100 text-yellow-800';
      case 'client': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading permissions...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role & Permissions Management
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingPermission(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Permission
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPermission ? 'Edit Permission' : 'Add New Permission'}
                  </DialogTitle>
                </DialogHeader>
                <PermissionForm 
                  permission={editingPermission}
                  roles={roles}
                  resources={resources}
                  actions={actions}
                  onSave={savePermission}
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Permission</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(permission.role)}>
                      {permission.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{permission.permission}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{permission.resource || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{permission.action}</Badge>
                  </TableCell>
                  <TableCell>{new Date(permission.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPermission(permission);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePermission(permission.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const PermissionForm = ({ 
  permission, 
  roles, 
  resources, 
  actions, 
  onSave 
}: { 
  permission: RolePermission | null;
  roles: string[];
  resources: string[];
  actions: string[];
  onSave: (data: Omit<RolePermission, 'id' | 'created_at'>) => void;
}) => {
  const [formData, setFormData] = useState({
    role: permission?.role || '',
    permission: permission?.permission || '',
    resource: permission?.resource || '',
    action: permission?.action || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="permission">Permission</Label>
        <Input
          value={formData.permission}
          onChange={(e) => setFormData(prev => ({ ...prev, permission: e.target.value }))}
          placeholder="e.g., manage, create, view"
          required
        />
      </div>

      <div>
        <Label htmlFor="resource">Resource</Label>
        <Select value={formData.resource} onValueChange={(value) => setFormData(prev => ({ ...prev, resource: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select resource" />
          </SelectTrigger>
          <SelectContent>
            {resources.map((resource) => (
              <SelectItem key={resource} value={resource}>{resource}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="action">Action</Label>
        <Select value={formData.action} onValueChange={(value) => setFormData(prev => ({ ...prev, action: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            {actions.map((action) => (
              <SelectItem key={action} value={action}>{action}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        {permission ? 'Update Permission' : 'Create Permission'}
      </Button>
    </form>
  );
};

export default RolePermissionsManager;
