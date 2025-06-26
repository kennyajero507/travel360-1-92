
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { 
  LayoutDashboard, 
  Users,
  BookOpen,
  Building,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { useSidebarCounts } from "../hooks/useSidebarCounts";

interface SimplifiedSidebarProps {
  className?: string;
}

const SimplifiedSidebar = ({ className }: SimplifiedSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { profile, checkRoleAccess, logout } = useAuth();
  const { data: counts, isLoading: countsLoading } = useSidebarCounts();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Simplified navigation - only 6 core items
  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent'],
      count: 0
    },
    {
      title: "Clients",
      href: "/clients",
      icon: Users,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent'],
      count: (counts?.clients || 0) + (counts?.inquiries || 0), // Combined count
      description: "Manage clients and inquiries"
    },
    {
      title: "Travel",
      href: "/travel",
      icon: BookOpen,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent'],
      count: (counts?.quotes || 0) + (counts?.bookings || 0) + (counts?.vouchers || 0),
      description: "Quotes, bookings, and vouchers"
    },
    {
      title: "Hotels",
      href: "/hotels",
      icon: Building,
      roles: ['system_admin', 'org_owner', 'tour_operator'],
      count: 0,
      description: "Hotel management"
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ['system_admin', 'org_owner', 'tour_operator'],
      count: 0,
      description: "Analytics and reports"
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent'],
      count: 0,
      description: "System settings"
    }
  ];

  const canAccess = (roles: string[]) => {
    return checkRoleAccess(roles);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className={cn(
      "simplified-sidebar h-full flex flex-col transition-all duration-300 bg-white border-r border-slate-200 shadow-sm",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        {!isCollapsed && (
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-blue-600">TravelFlow360</h1>
            <span className="text-xs text-slate-500 font-medium">Simple Travel Management</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 hover:bg-slate-100"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-2 px-2">
          {navigationItems.map((item) => {
            if (!canAccess(item.roles)) return null;
            
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-blue-50 hover:text-blue-700",
                  isCollapsed ? "justify-center" : "justify-start",
                  isActive(item.href) 
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600 font-semibold shadow-sm" 
                    : "text-slate-600"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>
                      )}
                    </div>
                    {item.count > 0 && (
                      <Badge variant="secondary" className="h-5 text-xs bg-blue-100 text-blue-700">
                        {countsLoading ? "..." : item.count}
                      </Badge>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {profile.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {profile.full_name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {profile.role?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Logout Button */}
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="w-full p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SimplifiedSidebar;
