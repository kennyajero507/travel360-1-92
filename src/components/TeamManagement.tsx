import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import { Users, UserPlus, Mail, Phone, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { teamService, TeamMember } from "../services/teamService";
import MobileOptimizedTable from "./mobile/MobileOptimizedTable";
import MobileResponsiveWrapper from "./mobile/MobileResponsiveWrapper";

const TeamManagement = () => {
  const { profile, sendInvitation, getInvitations, checkRoleAccess } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "agent" as 'tour_operator' | 'agent'
  });

  // Check access permissions
  const canManageTeam = checkRoleAccess(['system_admin', 'org_owner', 'tour_operator']);

  useEffect(() => {
    fetchTeamData();
  }, [profile?.org_id]);

  const fetchTeamData = async () => {
    if (!profile?.org_id || !canManageTeam) {
      setFetchingData(false);
      return;
    }

    try {
      setFetchingData(true);
      
      // Fetch team members and invitations in parallel
      const [members, invitationData] = await Promise.all([
        teamService.getTeamMembers(profile.org_id),
        getInvitations()
      ]);
      
      setTeamMembers(members);
      setInvitations(invitationData);
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setFetchingData(false);
    }
  };

  const handleInviteMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMember.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      const success = await sendInvitation(newMember.email, newMember.role);
      if (success) {
        setNewMember({ name: "", email: "", phone: "", role: "agent" });
        setDialogOpen(false);
        await fetchTeamData(); // Refresh data
        toast.success(`Invitation sent to ${newMember.email}`);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await teamService.updateMemberRole(memberId, newRole);
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
      toast.success("Member role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update member role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await teamService.removeMember(memberId);
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
      toast.success("Member removed from organization");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant="outline" className="capitalize">
        {role.replace('_', ' ')}
      </Badge>
    );
  };

  const canManageRole = (memberRole: string) => {
    if (profile?.role === 'system_admin') return true;
    if (profile?.role === 'org_owner') return true;
    if (profile?.role === 'tour_operator' && memberRole === 'agent') return true;
    return false;
  };

  const availableRoles = profile?.role === 'org_owner' 
    ? [
        { value: 'tour_operator', label: 'Tour Operator' },
        { value: 'agent', label: 'Travel Agent' }
      ]
    : [
        { value: 'agent', label: 'Travel Agent' }
      ];

  const convertToMobileItems = (members: TeamMember[]) => {
    return members.map(member => ({
      id: member.id,
      title: member.full_name || 'Unnamed User',
      subtitle: member.email,
      status: 'Active',
      statusColor: 'bg-green-100 text-green-800',
      metadata: [
        { label: 'Role', value: member.role.replace('_', ' ') },
        { label: 'Joined', value: new Date(member.created_at).toLocaleDateString() }
      ],
      actions: canManageRole(member.role) && member.id !== profile?.id ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>
              <Edit className="mr-2 h-4 w-4" />
              Change Role
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => handleRemoveMember(member.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : undefined
    }));
  };

  if (!canManageTeam) {
    return (
      <MobileResponsiveWrapper>
        <div className="text-center py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">You don't have permission to manage team members.</p>
            </CardContent>
          </Card>
        </div>
      </MobileResponsiveWrapper>
    );
  }

  if (fetchingData) {
    return (
      <MobileResponsiveWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team data...</p>
          </div>
        </div>
      </MobileResponsiveWrapper>
    );
  }

  return (
    <MobileResponsiveWrapper>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-600">Team Management</h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Manage your team members and their roles
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>Invite New Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select 
                    value={newMember.role} 
                    onValueChange={(value: 'tour_operator' | 'agent') => setNewMember({...newMember, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteMember} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({teamMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.full_name || 'Unnamed User'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {member.email}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>{getStatusBadge('active')}</TableCell>
                      <TableCell>
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {canManageRole(member.role) && member.id !== profile?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {}}>
                                <Edit className="mr-2 h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {teamMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No team members found. Invite some team members to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Optimized Cards - Shown on mobile and tablet */}
        <div className="lg:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Team Members ({teamMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MobileOptimizedTable items={convertToMobileItems(teamMembers)} />
            </CardContent>
          </Card>
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Pending Invitations ({invitations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>{invitation.email}</TableCell>
                        <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                        <TableCell>{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {invitation.used_at ? (
                            <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="sm:hidden space-y-3">
                {invitations.map((invitation) => (
                  <Card key={invitation.id}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{invitation.email}</p>
                            <Badge variant="outline" className="mt-1">
                              {invitation.role.replace('_', ' ')}
                            </Badge>
                          </div>
                          <Badge className={invitation.used_at ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {invitation.used_at ? 'Accepted' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          <p>Sent: {new Date(invitation.created_at).toLocaleDateString()}</p>
                          <p>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileResponsiveWrapper>
  );
};

export default TeamManagement;
