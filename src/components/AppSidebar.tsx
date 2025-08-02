import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useSimpleAuth } from "../contexts/SimpleAuthContext"
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Users, 
  Settings, 
  Building, 
  BarChart3,
  MapPin,
  Plane,
  CreditCard,
  HelpCircle,
  LogOut,
  Globe,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

export function AppSidebar() {
  const { profile, signOut } = useSimpleAuth()
  const { state } = useSidebar()
  const location = useLocation()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    main: true,
    admin: false
  })

  const isActive = (path: string) => location.pathname === path
  const collapsed = state === "closed"

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  const getNavigationItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    ]

    const roleSpecificItems = {
      system_admin: [
        { icon: Building, label: 'Organizations', path: '/admin/organizations' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: CreditCard, label: 'Subscriptions', path: '/admin/subscriptions' },
        { icon: BarChart3, label: 'System Analytics', path: '/admin/analytics' },
        { icon: Settings, label: 'System Settings', path: '/admin/settings' },
      ],
      org_owner: [
        { icon: MessageSquare, label: 'Inquiries', path: '/inquiries' },
        { icon: FileText, label: 'Quotes', path: '/quotes' },
        { icon: Calendar, label: 'Bookings', path: '/bookings' },
        { icon: Users, label: 'Team', path: '/team' },
        { icon: MapPin, label: 'Destinations', path: '/destinations' },
        { icon: Building, label: 'Hotels', path: '/hotels' },
        { icon: Plane, label: 'Transport', path: '/transport' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ],
      tour_operator: [
        { icon: MessageSquare, label: 'Inquiries', path: '/inquiries' },
        { icon: FileText, label: 'Quotes', path: '/quotes' },
        { icon: Calendar, label: 'Bookings', path: '/bookings' },
        { icon: Users, label: 'Agents', path: '/agents' },
        { icon: MapPin, label: 'Destinations', path: '/destinations' },
        { icon: Building, label: 'Hotels', path: '/hotels' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
      ],
      agent: [
        { icon: MessageSquare, label: 'My Inquiries', path: '/inquiries' },
        { icon: FileText, label: 'My Quotes', path: '/quotes' },
        { icon: Calendar, label: 'My Bookings', path: '/bookings' },
        { icon: Building, label: 'Hotels', path: '/hotels' },
        { icon: Plane, label: 'Transport', path: '/transport' },
      ],
      customer_service: [
        { icon: MessageSquare, label: 'Inquiries', path: '/inquiries' },
        { icon: Users, label: 'Clients', path: '/clients' },
        { icon: Calendar, label: 'Bookings', path: '/bookings' },
        { icon: HelpCircle, label: 'Support', path: '/support' },
      ],
      accounts: [
        { icon: Calendar, label: 'Bookings', path: '/bookings' },
        { icon: CreditCard, label: 'Payments', path: '/payments' },
        { icon: BarChart3, label: 'Financial Reports', path: '/reports/financial' },
        { icon: FileText, label: 'Invoices', path: '/invoices' },
      ],
    }

    const userRole = profile?.role as keyof typeof roleSpecificItems
    const roleItems = roleSpecificItems[userRole] || []

    return { baseItems, roleItems, isAdmin: userRole === 'system_admin' }
  }

  const { baseItems, roleItems, isAdmin } = getNavigationItems()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className="p-4">
        <NavLink to="/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Globe className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">TravelFlow360</h1>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Travel SaaS</p>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarSeparator />

      {/* User Info */}
      {profile && (
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {profile.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile.role?.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <SidebarSeparator />

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {baseItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <NavLink to={item.path}>
                      <item.icon />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Role-based Navigation */}
        {roleItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {isAdmin ? 'Administration' : 'Operations'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {roleItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive(item.path)}>
                      <NavLink to={item.path}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/help')}>
              <NavLink to="/help">
                <HelpCircle />
                <span>Help & Support</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild onClick={handleSignOut}>
              <button className="w-full">
                <LogOut />
                <span>Sign Out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}