import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  MapPin,
  Calendar,
  Settings,
  Home,
  Plane,
  TrendingUp,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Events", url: "/dashboard/events", icon: Calendar },
  { title: "Native Products", url: "/dashboard/native-products", icon: MapPin },
  { title: "Restaurants", url: "/dashboard/restaurants", icon: Users },
  { title: "Destinations", url: "/dashboard/destinations", icon: MapPin },
  { title: "Users", url: "/dashboard/users", icon: Users },
  { title: "Revenue", url: "/dashboard/revenue", icon: TrendingUp },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isCollapsed = state === "collapsed";

  const isActive = (path) => currentPath === path;

  const getNavClass = ({ isActive }) => {
    return isActive ? "active" : "inactive";
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Brand */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-tourism-ocean" />
            {!isCollapsed && (
              <span className="font-bold text-lg bg-gradient-to-r from-tourism-ocean to-tourism-sunset bg-clip-text text-transparent">
                TourismAdmin
              </span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}