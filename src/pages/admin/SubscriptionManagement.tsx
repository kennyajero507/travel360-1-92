import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, CreditCard, DollarSign, Calendar, TrendingUp, AlertCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';

const SubscriptionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  
  const {
    subscriptions,
    loading,
    error,
    updateSubscription,
    cancelSubscription,
    refetch
  } = useSubscriptionManagement();

  const [updateForm, setUpdateForm] = useState({
    tier: '',
    status: '',
    end_date: ''
  });

  const filteredSubscriptions = subscriptions?.filter(sub => {
    const matchesSearch = sub.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.owner_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.subscription_status === statusFilter;
    const matchesTier = tierFilter === 'all' || sub.subscription_tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  }) || [];

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubscription) return;
    
    try {
      await updateSubscription(selectedSubscription.id, updateForm);
      setIsUpdateDialogOpen(false);
      setSelectedSubscription(null);
      toast.success('Subscription updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      try {
        await cancelSubscription(subscriptionId);
        toast.success('Subscription cancelled successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to cancel subscription');
      }
    }
  };

  const openUpdateDialog = (subscription: any) => {
    setSelectedSubscription(subscription);
    setUpdateForm({
      tier: subscription.subscription_tier,
      status: subscription.subscription_status,
      end_date: subscription.subscription_end_date?.split('T')[0] || ''
    });
    setIsUpdateDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      active: { variant: 'default', icon: Check },
      trial: { variant: 'secondary', icon: Calendar },
      cancelled: { variant: 'destructive', icon: X },
      suspended: { variant: 'outline', icon: AlertCircle }
    };
    const config = variants[status] || variants.trial;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-gold-100 text-gold-800'
    };
    return (
      <Badge variant="outline" className={colors[tier] || colors.starter}>
        {tier}
      </Badge>
    );
  };

  const calculateRevenue = () => {
    return subscriptions?.reduce((total, sub) => {
      if (sub.subscription_status === 'active') {
        const tierPricing: Record<string, number> = {
          starter: 29,
          professional: 79,
          enterprise: 199
        };
        return total + (tierPricing[sub.subscription_tier] || 0);
      }
      return total;
    }, 0) || 0;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground">Monitor and manage all platform subscriptions</p>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateRevenue()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions?.filter(s => s.subscription_status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">+5 new this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Subscriptions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions?.filter(s => s.subscription_status === 'trial').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">3 expiring soon</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3%</div>
            <p className="text-xs text-muted-foreground">-0.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions List */}
      <div className="grid gap-4">
        {filteredSubscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{subscription.organization_name}</h3>
                    <p className="text-sm text-muted-foreground">{subscription.owner_email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(subscription.subscription_status)}
                      {getTierBadge(subscription.subscription_tier)}
                      {subscription.subscription_end_date && (
                        <span className="text-xs text-muted-foreground">
                          Expires: {new Date(subscription.subscription_end_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openUpdateDialog(subscription)}
                  >
                    Update
                  </Button>
                  {subscription.subscription_status === 'active' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCancelSubscription(subscription.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Update Subscription Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Subscription</DialogTitle>
            <DialogDescription>
              Modify the subscription details for {selectedSubscription?.organization_name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubscription} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tier">Subscription Tier</Label>
              <Select value={updateForm.tier} onValueChange={(value) => setUpdateForm({...updateForm, tier: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter ($29/month)</SelectItem>
                  <SelectItem value="professional">Professional ($79/month)</SelectItem>
                  <SelectItem value="enterprise">Enterprise ($199/month)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({...updateForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={updateForm.end_date}
                onChange={(e) => setUpdateForm({...updateForm, end_date: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Subscription</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {filteredSubscriptions.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No subscriptions found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || tierFilter !== 'all'
                ? 'Try adjusting your search criteria' 
                : 'No subscriptions available'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionManagement;