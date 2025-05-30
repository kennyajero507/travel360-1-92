
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  ClipboardList,
  FileText,
  Grid3X3,
  Landmark,
  List,
  MessageSquare,
  Receipt,
  Settings,
  User,
  UserCog,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";

interface SidebarProps {
  mobile?: boolean;
}

const Sidebar = ({ mobile = false }: SidebarProps) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { role, permissions } = useRole();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={cn("h-full px-4 bg-white border-r shadow-sm", mobile && "bg-blue-50")}>
      <div className="flex items-center justify-between py-4">
        <Link to="/" className="flex items-center text-xl font-bold">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-2" />
          <span>Tourify</span>
        </Link>
        {mobile && (
          <button onClick={toggleMenu} className="focus:outline-none">
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        )}
      </div>
      
      <div className="space-y-1 mt-6">
        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            location.pathname === "/dashboard" ? "bg-accent" : "transparent"
          )}
        >
          <Grid3X3 size={16} className="text-blue-600" />
          <span>Dashboard</span>
        </Link>
        
        {/* Calendar */}
        <Link
          to="/calendar"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            location.pathname === "/calendar" ? "bg-accent" : "transparent"
          )}
        >
          <Calendar size={16} className="text-blue-600" />
          <span>Calendar</span>
        </Link>
        
        {/* Hotels */}
        <Link
          to="/hotels"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            location.pathname.includes("/hotels") ? "bg-accent" : "transparent"
          )}
        >
          <Landmark size={16} className="text-blue-600" />
          <span>Hotels</span>
        </Link>
        
        {/* Clients */}
        {(currentUser.role === "agent" || currentUser.role === "tour_operator" || currentUser.role === "org_owner") && (
          <Link
            to="/clients"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              location.pathname.includes("/clients") ? "bg-accent" : "transparent"
            )}
          >
            <Users size={16} className="text-blue-600" />
            <span>Clients</span>
          </Link>
        )}
        
        {/* Inquiries */}
        {(currentUser.role === "agent" || currentUser.role === "tour_operator" || currentUser.role === "org_owner") && (
          <Link
            to="/inquiries"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              location.pathname.includes("/inquiries") ? "bg-accent" : "transparent"
            )}
          >
            <MessageSquare size={16} className="text-blue-600" />
            <span>Inquiries</span>
          </Link>
        )}
        
        {/* Quotes */}
        {(currentUser.role === "agent" || currentUser.role === "tour_operator" || currentUser.role === "org_owner") && (
          <Link
            to="/quotes"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              location.pathname.includes("/quotes") ? "bg-accent" : "transparent"
            )}
          >
            <Receipt size={16} className="text-blue-600" />
            <span>Quotes</span>
          </Link>
        )}
        
        {/* Bookings */}
        {(currentUser.role === "agent" || currentUser.role === "tour_operator" || currentUser.role === "org_owner") && (
          <Link
            to="/bookings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              location.pathname.includes("/bookings") ? "bg-accent" : "transparent"
            )}
          >
            <ClipboardList size={16} className="text-blue-600" />
            <span>Bookings</span>
          </Link>
        )}
        
        {/* Vouchers */}
        {(currentUser.role === "agent" || currentUser.role === "tour_operator" || currentUser.role === "org_owner") && (
          <Link
            to="/vouchers"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              location.pathname.includes("/vouchers") ? "bg-accent" : "transparent"
            )}
          >
            <FileText size={16} className="text-blue-600" />
            <span>Vouchers</span>
          </Link>
        )}
        
        {/* Team Management (for org_owner and tour_operator) */}
        {(currentUser.role === "org_owner" || currentUser.role === "tour_operator") && (
          <Link
            to="/team"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              location.pathname === "/team" ? "bg-accent" : "transparent"
            )}
          >
            <UserCog size={16} className="text-blue-600" />
            <span>Team Management</span>
          </Link>
        )}
        
        {/* Settings */}
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            location.pathname === "/settings" ? "bg-accent" : "transparent"
          )}
        >
          <Settings size={16} className="text-blue-600" />
          <span>Settings</span>
        </Link>
      </div>
      
      <div className="mt-auto py-4">
        <div className="border-t pt-4">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            <span className="text-sm font-medium">{currentUser.email}</span>
          </div>
          <button
            onClick={logout}
            className="mt-2 block w-full rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
