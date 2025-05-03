
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { useRole, UserRole } from "../../contexts/RoleContext";

const AccountSettings = () => {
  const { role, setRole, permissions } = useRole();

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    toast.success(`Role changed to ${selectedRole}`);
  };

  // Helper function to format role display text
  const formatRoleDisplay = (role: string): string => {
    switch (role) {
      case 'system_admin': return 'System Administrator';
      case 'org_owner': return 'Organization Owner';
      case 'team_manager': return 'Team Manager';
      case 'agent': return 'Travel Agent';
      case 'client': return 'Client';
      default: return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <label className="font-medium">Current Role</label>
          <Select value={role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full md:w-72 bg-white text-black">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system_admin">System Administrator</SelectItem>
              <SelectItem value="org_owner">Organization Owner</SelectItem>
              <SelectItem value="team_manager">Team Manager</SelectItem>
              <SelectItem value="agent">Travel Agent</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            Your role determines what actions you can perform in the system.
          </p>

          <div className="mt-4 border rounded p-4">
            <h3 className="font-medium mb-2">Role Permissions:</h3>
            <ul className="space-y-2 text-sm">
              <li className="pb-1 border-b">
                <strong>System Administrator:</strong> Full platform oversight with access to all organizations, global integrations, security policies, and system-wide analytics.
              </li>
              <li className="py-1 border-b">
                <strong>Organization Owner:</strong> Manage company account, team members, billing, hotel inventory with vendor lists, and access to all company quotes.
              </li>
              <li className="py-1 border-b">
                <strong>Team Manager:</strong> Oversee agent teams, assign inquiries, manage team-specific hotel inventory and preferred properties, monitor team performance.
                {permissions.canManageAgents && <span className="ml-1 text-green-600">(+ Agent management with Pro/Enterprise)</span>}
              </li>
              <li className="py-1 border-b">
                <strong>Travel Agent:</strong> Create quotes, submit hotels for approval, access approved hotel lists, communicate with clients.
              </li>
              <li className="pt-1">
                <strong>Client:</strong> View quotes via secure links, request modifications, approve quotes digitally.
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
