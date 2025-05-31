
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { Calendar, ChevronLeft, ChevronRight, FileText, Home, Settings, Users, Hotel, MessageSquare, Receipt, ClipboardList } from "lucide-react";
import { useRole } from "../contexts/role/useRole";
import { useAuth } from "../contexts/AuthContext";

interface VerticalNavProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const VerticalNav = ({ collapsed, setCollapsed }: VerticalNavProps) => {
  const { role, hasPermission } = useRole();
  const { userProfile, checkRoleAccess } = useAuth();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const currentRole = userProfile?.role || role;

  return (
    <nav
      className={cn(
        "fixed h-full bg-primary text-white shadow-lg transition-all duration-300 z-10",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <h1 className="text-xl font-bold tracking-tight">TravelFlow360</h1>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-full hover:bg-white/10 transition-all",
            collapsed ? "mx-auto" : ""
          )}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="py-4">
        {/* Dashboard - available to all */}
        <NavItem to="/dashboard" collapsed={collapsed} icon={<Home size={20} />} label="Dashboard" />
        
        {/* Inquiries - available to all except clients */}
        {checkRoleAccess(['system_admin', 'org_owner', 'tour_operator', 'agent']) && (
          <NavItem to="/inquiries" collapsed={collapsed} icon={<MessageSquare size={20} />} label="Inquiries" />
        )}
        
        {/* Quotes - available to all except clients */}
        {checkRoleAccess(['system_admin', 'org_owner', 'tour_operator', 'agent']) && (
          <NavItem to="/quotes" collapsed={collapsed} icon={<Receipt size={20} />} label="Quotes" />
        )}
        
        {/* Bookings - available to all except clients */}
        {checkRoleAccess(['system_admin', 'org_owner', 'tour_operator', 'agent']) && (
          <NavItem to="/bookings" collapsed={collapsed} icon={<ClipboardList size={20} />} label="Bookings" />
        )}
        
        {/* Vouchers - available to all except clients */}
        {checkRoleAccess(['system_admin', 'org_owner', 'tour_operator', 'agent']) && (
          <NavItem to="/vouchers" collapsed={collapsed} icon={<FileText size={20} />} label="Vouchers" />
        )}
        
        {/* Clients - available to all except clients */}
        {checkRoleAccess(['system_admin', 'org_owner', 'tour_operator', 'agent']) && (
          <NavItem to="/clients" collapsed={collapsed} icon={<Users size={20} />} label="Clients" />
        )}
        
        {/* Hotels - restricted to admin, org_owner, tour_operator */}
        {checkRoleAccess(['system_admin', 'org_owner', 'tour_operator']) && (
          <NavItem to="/hotels" collapsed={collapsed} icon={<Hotel size={20} />} label="Hotels" />
        )}
        
        {/* Calendar - available to all */}
        <NavItem to="/calendar" collapsed={collapsed} icon={<Calendar size={20} />} label="Calendar" />
        
        {/* Settings - available to all */}
        <NavItem to="/settings" collapsed={collapsed} icon={<Settings size={20} />} label="Settings" />
        
        {/* Admin Dashboard - only for system_admin */}
        {checkRoleAccess(['system_admin']) && (
          <NavItem to="/admin/dashboard" collapsed={collapsed} icon={<Home size={20} />} label="Admin Dashboard" />
        )}
      </div>
      
      {!collapsed && userProfile && (
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="bg-white/10 rounded-md p-2 text-center text-xs">
            <div className="font-medium">Current Role:</div>
            <div className="uppercase mt-1">
              {userProfile.role === 'agent' && 'Travel Agent'}
              {userProfile.role === 'tour_operator' && 'Tour Operator'}
              {userProfile.role === 'org_owner' && 'Organization Owner'}
              {userProfile.role === 'system_admin' && 'System Admin'}
              {userProfile.role === 'client' && 'Client'}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem = ({ to, icon, label, collapsed }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-4 py-3 px-4 transition-colors hover:bg-primary-hover",
          collapsed ? "justify-center px-2" : "",
          isActive ? "bg-white/10" : ""
        )
      }
    >
      <div>{icon}</div>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

export default VerticalNav;
