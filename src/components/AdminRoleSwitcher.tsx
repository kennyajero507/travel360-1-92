
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Shield, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";

type Role = 'system_admin' | 'org_owner' | 'tour_operator' | 'agent' | 'client';

const AdminRoleSwitcher = () => {
  const { profile, user } = useAuth();
  
  if (!profile || profile.role !== 'system_admin') return null;
  
  const roles: Role[] = ['system_admin', 'org_owner', 'tour_operator', 'agent', 'client'];
  
  const handleRoleChange = async (role: Role) => {
    try {
      if (!user) {
        toast.error("No authenticated user found");
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast.success(`Role switched to ${role}`);
      
      // Reload page to update permissions
      window.location.reload();
    } catch (error) {
      console.error("Error switching role:", error);
      toast.error("Failed to switch role");
    }
  };
  
  return (
    <div className="flex items-center bg-amber-100 rounded-lg p-2 text-amber-800">
      <Shield className="h-4 w-4 mr-2" />
      <span className="text-xs mr-2">Admin Mode</span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 bg-amber-50 border-amber-300 text-amber-800">
            <span>Role: {profile.role}</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
          {roles.map((role) => (
            <DropdownMenuItem 
              key={role} 
              onClick={() => handleRoleChange(role)}
              className={`${profile.role === role ? 'bg-amber-50 font-semibold' : ''}`}
            >
              {role}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AdminRoleSwitcher;
