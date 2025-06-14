
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Building, 
  Users,
  Settings,
  BarChart3,
  BookOpen,
  Plane,
  ChevronLeft,
  ChevronRight,
  UserCog,
  LogOut
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface ProfessionalSidebarProps {
  className?: string;
}

const ProfessionalSidebar = ({ className }: ProfessionalSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { profile, checkRoleAccess, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent'],
      count: 0
    },
    {
      title: "Inquiries",
      href: "/inquiries",
      icon: MessageSquare,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent'],
      count: 3
    },
    {
      title: "Quotes",
      href: "/quotes",
      icon: FileText,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent'],
      count: 5
    },
    {
      title: "Bookings",
      href: "/bookings",
      icon: BookOpen,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent'],
      count: 2
    },
    {
      title: "Vouchers",
      href: "/vouchers",
      icon: Plane,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent'],
      count: 0
    },
    {
      title: "Hotels",
      href: "/hotels",
      icon: Building,
      roles: ['system_admin', 'org_owner', 'tour_operator'],
      count: 0
    },
    {
      title: "Clients",
      href: "/clients",
      icon: Users,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent'],
      count: 0
    }
  ];

  const managementItems = [
    {
      title: "Team Management",
      href: "/team",
      icon: UserCog,
      roles: ['system_admin', 'org_owner', 'tour_operator'],
      count: 0
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ['system_admin', 'org_owner', 'tour_operator'],
      count: 0
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent'],
      count: 0
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
      "professional-sidebar h-full flex flex-col transition-all duration-300 bg-white border-r border-slate-200 shadow-sm",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        {!isCollapsed && (
          <div className="flex flex-col">
            <h1 className="professional-logo text-xl font-bold">TravelFlow360</h1>
            <span className="professional-brand text-xs text-slate-500 font-medium">Travel Management System</span>
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
        <div className="space-y-1 px-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Main Menu
                </p>
              </div>
            )}
            {navigationItems.map((item) => {
              if (!canAccess(item.roles)) return null;
              
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-slate-50 hover:text-slate-900",
                    isCollapsed ? "justify-center" : "justify-start",
                    isActive(item.href) 
                      ? "bg-government-50 text-government-700 border-l-4 border-government-600 font-semibold" 
                      : "text-slate-600"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.count > 0 && (
                        <Badge variant="secondary" className="h-5 text-xs bg-slate-100 text-slate-700">
                          {item.count}
                        </Badge>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Management Section */}
          {!isCollapsed && <Separator className="my-4" />}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 py-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Management
                </p>
              </div>
            )}
            {managementItems.map((item) => {
              if (!canAccess(item.roles)) return null;
              
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-slate-50 hover:text-slate-900",
                    isCollapsed ? "justify-center" : "justify-start",
                    isActive(item.href) 
                      ? "bg-government-50 text-government-700 border-l-4 border-government-600 font-semibold" 
                      : "text-slate-600"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.count > 0 && (
                        <Badge variant="secondary" className="h-5 text-xs bg-slate-100 text-slate-700">
                          {item.count}
                        </Badge>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="bg-government-50 rounded-lg p-3 border border-government-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-government-500 flex items-center justify-center">
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
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfessionalSidebar;
