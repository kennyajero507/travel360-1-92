import { useState, useEffect } from 'react';
import { useSimpleAuth } from '../contexts/SimpleAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Users, UserPlus, Mail, Phone, Calendar, Edit, Trash2, Search, Filter } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const TeamPage = () => {
  const { profile } = useSimpleAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'agent',
    message: ''
  });

  const roles = [
    { value: 'org_owner', label: 'Organization Owner', color: 'destructive' },
    { value: 'tour_operator', label: 'Tour Operator', color: 'default' },
    { value: 'agent', label: 'Agent', color: 'secondary' },
    { value: 'customer_service', label: 'Customer Service', color: 'outline' },
    { value: 'accounts', label: 'Accounts', color: 'secondary' }
  ];

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('org_id', profile?.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    try {
      const { error } = await supabase
        .from('invitations')
        .insert({
          email: inviteForm.email,
          role: inviteForm.role,
          org_id: profile?.org_id,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Invitation sent successfully');
      setShowInviteDialog(false);
      setInviteForm({ email: '', role: 'agent', message: '' });
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      
      toast.success('Member role updated successfully');
      fetchTeamMembers();
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ org_id: null })
        .eq('id', memberId);

      if (error) throw error;
      
      toast.success('Member removed from team');
      fetchTeamMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    const roleConfig = roles.find(r => r.value === role);
    return roleConfig?.color || 'secondary';
  };

  const canManageTeam = profile?.role === 'org_owner' || profile?.role === 'tour_operator';

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-2">Manage your organization's team members and roles</p>
        </div>
        {canManageTeam && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="colleague@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.filter(role => role.value !== 'org_owner').map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={sendInvitation}>
                    Send Invitation
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
          <TabsTrigger value="roles">Role Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members ({filteredMembers.length})
                  </CardTitle>
                  <CardDescription>
                    View and manage your organization's team members
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading team members...</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No team members found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {member.full_name?.charAt(0) || member.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.full_name || 'Unnamed User'}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {member.email}
                            </div>
                            {member.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {member.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined {new Date(member.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeColor(member.role) as any}>
                          {roles.find(r => r.value === member.role)?.label || member.role}
                        </Badge>
                        {canManageTeam && member.id !== profile?.id && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newRole = prompt('Enter new role:', member.role);
                                if (newRole && newRole !== member.role) {
                                  updateMemberRole(member.id, newRole);
                                }
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to remove this member?')) {
                                  removeMember(member.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Invitations that have been sent but not yet accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Invitation management coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Overview of what each role can do in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map(role => (
                  <div key={role.value} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={role.color as any}>{role.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Permissions configuration for {role.label} coming soon...
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamPage;