
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
              <SelectItem value="agent">Travel Agent</SelectItem>
              <SelectItem value="operator">Tour Operator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">
            Your role determines what actions you can perform in the system.
          </p>

          <div className="mt-4 border rounded p-4">
            <h3 className="font-medium mb-2">Role Permissions:</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Travel Agent:</strong> Create/edit quotes, manage hotel inventory for assigned inquiries.</li>
              <li><strong>Tour Operator:</strong> Assign inquiries, manage hotels, view team metrics{permissions.canManageAgents ? ', manage agents' : ''}.</li>
              <li><strong>Admin:</strong> Manage subscriptions, billing, agents, and system access.</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
