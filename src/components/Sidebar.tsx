import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Building, 
  Calendar,
  Users,
  Settings,
  BarChart3,
  BookOpen,
  Plane,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { profile, checkRoleAccess } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const canAccess = (roles: string[]) => {
    return checkRoleAccess(roles);
  };

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent']
    },
    {
      title: "Inquiries",
      href: "/inquiries",
      icon: MessageSquare,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent']
    },
    {
      title: "Quotes",
      href: "/quotes",
      icon: FileText,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent']
    },
    {
      title: "Bookings",
      href: "/bookings",
      icon: BookOpen,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent']
    },
    {
      title: "Hotels",
      href: "/hotels",
      icon: Building,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent']
    },
    {
      title: "Vouchers",
      href: "/vouchers",
      icon: Plane,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent']
    },
    {
      title: "Clients",
      href: "/clients",
      icon: Users,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent']
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ['system_admin', 'org_owner', 'tour_operator']
    },
    {
      title: "Team Management",
      href: "/team",
      icon: Users,
      roles: ['system_admin', 'org_owner', 'tour_operator']
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ['system_admin', 'org_owner', 'tour_operator', 'agent']
    }
  ];

  if (!profile) {
    return null;
  }

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-2 p-2">
                {navigationItems.map((item) => {
                  if (!canAccess(item.roles)) return null;
                  
                  return (
                    <Button
                      key={item.href}
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2",
                        isActive(item.href) && "bg-muted font-medium"
                      )}
                      asChild
                    >
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
