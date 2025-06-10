
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
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
  Menu,
  UserCog
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Separator } from "./ui/separator";

interface ProfessionalSidebarProps {
  className?: string;
}

const ProfessionalSidebar = ({ className }: ProfessionalSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { userProfile, checkRoleAccess } = useAuth();

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

  if (!userProfile) {
    return null;
  }

  return (
    <div className={cn(
      "professional-sidebar h-full flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b professional-divider">
        {!isCollapsed && (
          <div className="flex flex-col">
            <h1 className="professional-logo">TravelFlow360</h1>
            <span className="professional-brand">Travel Management System</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
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
                    "professional-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isCollapsed ? "justify-center" : "justify-start",
                    isActive(item.href) ? "active" : ""
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.count > 0 && (
                        <Badge variant="secondary" className="h-5 text-xs">
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
                    "professional-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isCollapsed ? "justify-center" : "justify-start",
                    isActive(item.href) ? "active" : ""
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.count > 0 && (
                        <Badge variant="secondary" className="h-5 text-xs">
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
      {!isCollapsed && userProfile && (
        <div className="p-4 border-t professional-divider">
          <div className="bg-government-50 rounded-lg p-3 border border-government-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-government-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userProfile.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {userProfile.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {userProfile.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalSidebar;
