
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { 
  Building, 
  Pause, 
  Play, 
  Settings, 
  CreditCard, 
  Calendar,
  Users,
  Activity
} from 'lucide-react';
import { Organization, SubscriptionStatus, BillingCycle, OrganizationStatus } from '../../types/admin.types';

const EnhancedOrganizationManagement = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [subscriptionDialog, setSubscriptionDialog] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion with proper validation
      const typedOrganizations: Organization[] = (data || []).map(org => ({
        ...org,
        status: (org.status as OrganizationStatus) || 'active',
        subscription_status: (org.subscription_status as SubscriptionStatus) || 'trial',
        billing_cycle: (org.billing_cycle as BillingCycle) || 'monthly'
      }));
      
      setOrganizations(typedOrganizations);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  const updateOrganizationStatus = async (orgId: string, status: OrganizationStatus) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ status })
        .eq('id', orgId);

      if (error) throw error;

      // Log admin activity
      await supabase.rpc('log_admin_activity', {
        p_action: `organization_${status}`,
        p_target_type: 'organization',
        p_target_id: orgId,
        p_details: { status, timestamp: new Date().toISOString() }
      });

      toast.success(`Organization ${status === 'suspended' ? 'suspended' : 'activated'} successfully`);
      fetchOrganizations();
    } catch (error) {
      console.error('Error updating organization status:', error);
      toast.error('Failed to update organization status');
    }
  };

  const updateSubscription = async (orgId: string, subscriptionData: {
    status: SubscriptionStatus;
    billing_cycle: BillingCycle;
    start_date: string;
    end_date: string;
  }) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          subscription_status: subscriptionData.status,
          billing_cycle: subscriptionData.billing_cycle,
          subscription_start_date: subscriptionData.start_date,
          subscription_end_date: subscriptionData.end_date
        })
        .eq('id', orgId);

      if (error) throw error;

      await supabase.rpc('log_admin_activity', {
        p_action: 'subscription_updated',
        p_target_type: 'organization',
        p_target_id: orgId,
        p_details: subscriptionData
      });

      toast.success('Subscription updated successfully');
      setSubscriptionDialog(false);
      fetchOrganizations();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const getStatusBadge = (status: OrganizationStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubscriptionBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'trial':
        return <Badge className="bg-purple-100 text-purple-800">Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-orange-100 text-orange-800">Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading organizations...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Enhanced Organization Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>{getStatusBadge(org.status)}</TableCell>
                  <TableCell>{getSubscriptionBadge(org.subscription_status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {org.billing_cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {org.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOrganizationStatus(org.id, 'suspended')}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOrganizationStatus(org.id, 'active')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      )}
                      
                      <Dialog open={subscriptionDialog} onOpenChange={setSubscriptionDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrg(org)}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Subscription
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage Subscription - {selectedOrg?.name}</DialogTitle>
                          </DialogHeader>
                          <SubscriptionForm 
                            organization={selectedOrg} 
                            onUpdate={updateSubscription}
                          />
                        </DialogContent>
                      </Dialog>
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

const SubscriptionForm = ({ organization, onUpdate }: { 
  organization: Organization | null, 
  onUpdate: (orgId: string, data: {
    status: SubscriptionStatus;
    billing_cycle: BillingCycle;
    start_date: string;
    end_date: string;
  }) => void 
}) => {
  const [formData, setFormData] = useState({
    status: organization?.subscription_status || 'trial' as SubscriptionStatus,
    billing_cycle: organization?.billing_cycle || 'monthly' as BillingCycle,
    start_date: organization?.subscription_start_date || '',
    end_date: organization?.subscription_end_date || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (organization) {
      onUpdate(organization.id, formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">Subscription Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value: SubscriptionStatus) => 
            setFormData(prev => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="billing_cycle">Billing Cycle</Label>
        <Select 
          value={formData.billing_cycle} 
          onValueChange={(value: BillingCycle) => 
            setFormData(prev => ({ ...prev, billing_cycle: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="start_date">Start Date</Label>
        <Input
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="end_date">End Date</Label>
        <Input
          type="date"
          value={formData.end_date}
          onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
        />
      </div>

      <Button type="submit" className="w-full">
        Update Subscription
      </Button>
    </form>
  );
};

export default EnhancedOrganizationManagement;
