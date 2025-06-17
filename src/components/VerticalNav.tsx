
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { ChevronLeft, ChevronRight, FileText, Home, Settings, Users, Hotel, MessageSquare, Receipt, ClipboardList, BarChart3, UserCog, Map } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface VerticalNavProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const VerticalNav = ({ collapsed, setCollapsed }: VerticalNavProps) => {
  const { role, hasPermission, profile, checkRoleAccess } = useAuth();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const currentRole = profile?.role || role;

  return (
    <nav
      className={cn(
        "fixed h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl transition-all duration-300 z-10 border-r border-slate-700",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && (
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            TravelFlow360
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-full hover:bg-slate-700 transition-all duration-200",
            collapsed ? "mx-auto" : ""
          )}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="py-4 space-y-1">
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
        
        {/* Tours - restricted to admin, org_owner, tour_operator */}
        {checkRoleAccess(['system_admin', 'org_owner', 'tour_operator']) && (
          <NavItem to="/tours" collapsed={collapsed} icon={<Map size={20} />} label="Tours" />
        )}
        
        {/* Clients - available to all except clients */}
        {checkRoleAccess(['system_admin', 'org_owner', 'tour_operator', 'agent']) && (
          <NavItem to="/clients" collapsed={collapsed} icon={<Users size={20} />} label="Clients" />
        )}
        
        {/* Hotels - restricted to admin, org_owner, tour_operator */}
        {checkRoleAccess(['system_admin', 'org_owner', 'tour_operator']) && (
          <NavItem to="/hotels" collapsed={collapsed} icon={<Hotel size={20} />} label="Hotels" />
        )}

        {/* Agent Management - only for org_owner */}
        {checkRoleAccess(['org_owner']) && (
          <NavItem to="/agent-management" collapsed={collapsed} icon={<UserCog size={20} />} label="Agent Management" />
        )}

        {/* Reports - available to all except clients */}
        {checkRoleAccess(['system_admin', 'org_owner', 'tour_operator', 'agent']) && (
          <NavItem to="/reports" collapsed={collapsed} icon={<BarChart3 size={20} />} label="Reports" />
        )}
        
        {/* Settings - available to all */}
        <NavItem to="/settings" collapsed={collapsed} icon={<Settings size={20} />} label="Settings" />
        
        {/* Admin Dashboard - only for system_admin */}
        {checkRoleAccess(['system_admin']) && (
          <NavItem to="/admin/dashboard" collapsed={collapsed} icon={<Home size={20} />} label="Admin Dashboard" />
        )}
      </div>
      
      {!collapsed && profile && (
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center text-xs border border-slate-600">
            <div className="font-medium text-slate-300">Current Role:</div>
            <div className="uppercase mt-1 text-blue-400 font-semibold">
              {profile.role === 'agent' && 'Travel Agent'}
              {profile.role === 'tour_operator' && 'Tour Operator'}
              {profile.role === 'org_owner' && 'Organization Owner'}
              {profile.role === 'system_admin' && 'System Admin'}
              {profile.role === 'client' && 'Client'}
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
          "flex items-center gap-4 py-3 px-4 mx-2 rounded-lg transition-all duration-200 hover:bg-slate-700/50",
          collapsed ? "justify-center px-2" : "",
          isActive ? "bg-blue-600/20 text-blue-400 border-r-2 border-blue-400" : "text-slate-300 hover:text-white"
        )
      }
    >
      <div>{icon}</div>
      {!collapsed && <span className="font-medium">{label}</span>}
    </NavLink>
  );
};

export default VerticalNav;
