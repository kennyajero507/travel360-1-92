
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Users,
  Database,
  Shield,
  FileSearch,
  FileText,
  ShieldCheck,
  Settings,
  Mail,
  Building,
  Table,
  Terminal
} from 'lucide-react';

const sidebarSections = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { title: "System Health", href: "/admin/monitoring", icon: Activity },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3 }
    ]
  },
  {
    title: "User Management",
    items: [
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "Organizations", href: "/admin/organizations", icon: Database },
      { title: "Enhanced Orgs", href: "/admin/enhanced-organizations", icon: Building },
      { title: "Roles & Permissions", href: "/admin/role-permissions", icon: Shield }
    ]
  },
  {
    title: "System Operations",
    items: [
      { title: "Live Table Viewer", href: "/admin/table-viewer", icon: Table },
      { title: "SQL Executor", href: "/admin/sql-executor", icon: Terminal },
      { title: "Database", href: "/admin/database", icon: Database },
      { title: "System Logs", href: "/admin/logs", icon: FileText }
    ]
  },
  {
    title: "Security",
    items: [
      { title: "Security Events", href: "/admin/security", icon: Shield },
      { title: "Audit Logs", href: "/admin/audit", icon: FileSearch },
      { title: "Access Control", href: "/admin/access", icon: ShieldCheck }
    ]
  },
  {
    title: "Settings",
    items: [
      { title: "System Settings", href: "/admin/settings", icon: Settings },
      { title: "Email Templates", href: "/admin/templates", icon: Mail },
      { title: "Maintenance", href: "/admin/maintenance", icon: Settings }
    ]
  }
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
      </div>
      <nav className="mt-2">
        <div className="px-2 pb-8 space-y-6">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <div className="px-2 py-1 text-xs uppercase font-semibold text-gray-400 tracking-wider">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};
