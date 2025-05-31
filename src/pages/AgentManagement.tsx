
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Users, UserPlus, Mail, MoreVertical, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { teamService, TeamMember } from "../services/teamService";
import InvitationManager from "../components/InvitationManager";

const AgentManagement = () => {
  const { userProfile, checkRoleAccess } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Check access
  const canManageAgents = checkRoleAccess(['system_admin', 'org_owner']);

  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!userProfile?.org_id || !canManageAgents) {
        setLoading(false);
        return;
      }

      try {
        const members = await teamService.getTeamMembers(userProfile.org_id);
        setTeamMembers(members);
      } catch (error) {
        console.error("Error loading team members:", error);
        toast.error("Failed to load team members");
      } finally {
        setLoading(false);
      }
    };

    loadTeamMembers();
  }, [userProfile?.org_id, canManageAgents]);

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

  const filteredMembers = teamMembers.filter(member =>
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!canManageAgents) {
    return (
      <div className="flex justify-center items-center h-64">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to manage agents. Only organization owners and system administrators can access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-teal-600">Agent Management</h1>
          <p className="text-gray-500 mt-2">Manage your team members and their roles</p>
        </div>
      </div>

      {/* Invitation Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite New Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvitationManager />
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Members List */}
          <div className="space-y-4">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No team members match your search." : "No team members found. Invite some team members to get started."}
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-teal-600 font-medium">
                        {member.full_name?.charAt(0)?.toUpperCase() || member.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{member.full_name || 'Unnamed User'}</h4>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{member.role.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={member.role}
                      onValueChange={(newRole) => handleRoleChange(member.id, newRole)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="tour_operator">Tour Operator</SelectItem>
                        {userProfile?.role === 'system_admin' && (
                          <SelectItem value="org_owner">Organization Owner</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    
                    {member.id !== userProfile?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.full_name || member.email} from your organization? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentManagement;
